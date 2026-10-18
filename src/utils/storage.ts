import {
  createInitialGameState,
  EVIDENCE_ITEMS,
  INITIAL_SCRAMBLED_TIMELINE_IDS,
  TIMELINE_EVENTS,
} from '../data/storyData';
import { EndingId, EvidenceType, GamePhase, GameState, WorkspaceTab } from '../types/mystery';

const STORAGE_KEY = 'the_last_signal_vesper9_state_v1';

const VALID_PHASES: GamePhase[] = ['opening', 'investigation', 'ending'];
const VALID_TABS: WorkspaceTab[] = ['archive', 'decoder', 'timeline', 'decision'];
const VALID_ENDINGS: EndingId[] = ['rescue', 'containment', 'unresolved'];
const VALID_EVIDENCE_IDS = new Set(EVIDENCE_ITEMS.map((item) => item.id));
const VALID_TIMELINE_IDS = new Set(TIMELINE_EVENTS.map((item) => item.id));
const VALID_ANNOTATION_IDS = new Set(
  EVIDENCE_ITEMS.flatMap((item) => item.annotations.map((ann) => ann.id))
);
const VALID_FILTERS: Array<'all' | EvidenceType> = [
  'all',
  'transmission',
  'document',
  'log',
  'photograph',
  'report',
  'audio-transcript',
  'sealed-message',
];

export function validateAndSanitizeGameState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;

  if (candidate.version !== 1) return null;
  if (!VALID_PHASES.includes(candidate.phase as GamePhase)) return null;

  const fallback = createInitialGameState();

  const chapter =
    candidate.chapter === 1 ||
    candidate.chapter === 2 ||
    candidate.chapter === 3 ||
    candidate.chapter === 4
      ? candidate.chapter
      : 1;

  const discoveredEvidenceIds = Array.isArray(candidate.discoveredEvidenceIds)
    ? candidate.discoveredEvidenceIds.filter(
        (id): id is string => typeof id === 'string' && VALID_EVIDENCE_IDS.has(id)
      )
    : fallback.discoveredEvidenceIds;

  // Ensure initial unlocked evidence is always present
  for (const initId of fallback.discoveredEvidenceIds) {
    if (!discoveredEvidenceIds.includes(initId)) {
      discoveredEvidenceIds.push(initId);
    }
  }

  const investigatedEvidenceIds = Array.isArray(candidate.investigatedEvidenceIds)
    ? candidate.investigatedEvidenceIds.filter(
        (id): id is string =>
          typeof id === 'string' &&
          VALID_EVIDENCE_IDS.has(id) &&
          discoveredEvidenceIds.includes(id)
      )
    : [];

  const discoveredAnnotationIds = Array.isArray(candidate.discoveredAnnotationIds)
    ? candidate.discoveredAnnotationIds.filter(
        (id): id is string => typeof id === 'string' && VALID_ANNOTATION_IDS.has(id)
      )
    : [];

  const selectedEvidenceId =
    typeof candidate.selectedEvidenceId === 'string' &&
    discoveredEvidenceIds.includes(candidate.selectedEvidenceId)
      ? candidate.selectedEvidenceId
      : null;

  const activeTab = VALID_TABS.includes(candidate.activeTab as WorkspaceTab)
    ? (candidate.activeTab as WorkspaceTab)
    : 'archive';

  const evidenceFilter = VALID_FILTERS.includes(candidate.evidenceFilter as 'all' | EvidenceType)
    ? (candidate.evidenceFilter as 'all' | EvidenceType)
    : 'all';

  const rawPuzzles =
    candidate.puzzles && typeof candidate.puzzles === 'object'
      ? (candidate.puzzles as Record<string, unknown>)
      : {};

  const rawDecoder =
    rawPuzzles.decoder && typeof rawPuzzles.decoder === 'object'
      ? (rawPuzzles.decoder as Record<string, unknown>)
      : {};

  const rawTimeline =
    rawPuzzles.timeline && typeof rawPuzzles.timeline === 'object'
      ? (rawPuzzles.timeline as Record<string, unknown>)
      : {};

  const rawDecision =
    rawPuzzles.finalDecision && typeof rawPuzzles.finalDecision === 'object'
      ? (rawPuzzles.finalDecision as Record<string, unknown>)
      : {};

  let timelineOrder = Array.isArray(rawTimeline.currentOrder)
    ? rawTimeline.currentOrder.filter(
        (id): id is string => typeof id === 'string' && VALID_TIMELINE_IDS.has(id)
      )
    : [...INITIAL_SCRAMBLED_TIMELINE_IDS];

  if (
    timelineOrder.length !== TIMELINE_EVENTS.length ||
    new Set(timelineOrder).size !== TIMELINE_EVENTS.length
  ) {
    timelineOrder = [...INITIAL_SCRAMBLED_TIMELINE_IDS];
  }

  const decoderSolved = Boolean(rawDecoder.solved);
  const timelineSolved = Boolean(rawTimeline.solved);

  // Ensure unlocked evidence consistency with solved puzzles
  if (decoderSolved && !discoveredEvidenceIds.includes('ev-recovered-audio')) {
    discoveredEvidenceIds.push('ev-recovered-audio');
  }
  if (timelineSolved && !discoveredEvidenceIds.includes('ev-sealed-message')) {
    discoveredEvidenceIds.push('ev-sealed-message');
  }

  const endingId = VALID_ENDINGS.includes(rawDecision.endingId as EndingId)
    ? (rawDecision.endingId as EndingId)
    : null;

  const phase: GamePhase =
    candidate.phase === 'ending' && !endingId
      ? 'investigation'
      : (candidate.phase as GamePhase);

  return {
    version: 1,
    phase,
    openingRevealed: Boolean(candidate.openingRevealed),
    chapter,
    discoveredEvidenceIds,
    investigatedEvidenceIds,
    discoveredAnnotationIds,
    selectedEvidenceId,
    activeTab,
    evidenceFilter,
    puzzles: {
      decoder: {
        solved: decoderSolved,
        attempts: typeof rawDecoder.attempts === 'number' ? Math.max(0, rawDecoder.attempts) : 0,
        lastInput: typeof rawDecoder.lastInput === 'string' ? rawDecoder.lastInput : '',
        hintsUsed:
          typeof rawDecoder.hintsUsed === 'number'
            ? Math.min(3, Math.max(0, rawDecoder.hintsUsed))
            : 0,
      },
      timeline: {
        solved: timelineSolved,
        attempts: typeof rawTimeline.attempts === 'number' ? Math.max(0, rawTimeline.attempts) : 0,
        currentOrder: timelineOrder,
        hintsUsed:
          typeof rawTimeline.hintsUsed === 'number'
            ? Math.min(3, Math.max(0, rawTimeline.hintsUsed))
            : 0,
      },
      finalDecision: {
        selectedChoiceId:
          typeof rawDecision.selectedChoiceId === 'string' ? rawDecision.selectedChoiceId : null,
        endingId,
      },
    },
    soundEnabled: false, // Always start muted on page load per requirement 11
    lastUpdated:
      typeof candidate.lastUpdated === 'string'
        ? candidate.lastUpdated
        : new Date().toISOString(),
  };
}

export function loadSavedGameState(): GameState | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const parsed: unknown = JSON.parse(serialized);
    return validateAndSanitizeGameState(parsed);
  } catch {
    return null;
  }
}

export function saveGameState(state: GameState): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedGameState(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function hasSavedProgress(state: GameState | null): boolean {
  if (!state) return false;
  return (
    state.phase !== 'opening' ||
    state.openingRevealed ||
    state.investigatedEvidenceIds.length > 0 ||
    state.discoveredAnnotationIds.length > 0 ||
    state.puzzles.decoder.solved ||
    state.puzzles.timeline.solved ||
    state.puzzles.decoder.attempts > 0 ||
    state.puzzles.timeline.attempts > 0
  );
}
