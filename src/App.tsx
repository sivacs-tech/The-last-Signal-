import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
  RotateCcw,
  Radio,
  FolderOpen,
  KeyRound,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import {
  CHAPTERS,
  createInitialGameState,
  deriveObjectives,
  EVIDENCE_ITEMS,
  STATION_METADATA,
  TIMELINE_EVENTS,
} from './data/storyData';
import { EndingId, EvidenceType, GameState, WorkspaceTab } from './types/mystery';
import {
  clearSavedGameState,
  hasSavedProgress,
  loadSavedGameState,
  saveGameState,
} from './utils/storage';
import { playTerminalSound } from './utils/sound';
import { OpeningTransmission } from './components/OpeningTransmission';
import { EvidenceArchive } from './components/EvidenceArchive';
import { DecoderPuzzle } from './components/DecoderPuzzle';
import { TimelinePuzzle } from './components/TimelinePuzzle';
import { FinalDecisionPanel } from './components/FinalDecisionPanel';
import { EvidenceViewerModal } from './components/EvidenceViewerModal';
import { EndingView } from './components/EndingView';

export default function App() {
  const [savedOnBoot] = useState<GameState | null>(() => loadSavedGameState());
  const [gameState, setGameState] = useState<GameState>(() => {
    // Always begin on the opening transmission screen so first-time visitors experience it,
    // while offering "Resume Investigation" if savedOnBoot has progress.
    if (savedOnBoot) {
      return {
        ...savedOnBoot,
        soundEnabled: false, // Never autoplay audio
      };
    }
    return createInitialGameState();
  });

  const [showOpeningScreen, setShowOpeningScreen] = useState<boolean>(
    () => !savedOnBoot || savedOnBoot.phase === 'opening'
  );
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Persist state changes safely to localStorage
  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const triggerSound = useCallback(
    (type: 'tick' | 'open' | 'unlock' | 'error' | 'clue' | 'transmit') => {
      playTerminalSound(type, gameState.soundEnabled);
    },
    [gameState.soundEnabled]
  );

  const handleToggleSound = useCallback(() => {
    setGameState((prev) => {
      const nextSound = !prev.soundEnabled;
      if (nextSound) {
        playTerminalSound('open', true);
      }
      return {
        ...prev,
        soundEnabled: nextSound,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const handleRevealOpeningHeadline = useCallback(() => {
    triggerSound('unlock');
    setGameState((prev) => ({
      ...prev,
      openingRevealed: true,
      lastUpdated: new Date().toISOString(),
    }));
  }, [triggerSound]);

  const handleEnterWorkspace = useCallback(() => {
    triggerSound('open');
    setShowOpeningScreen(false);
    setGameState((prev) => ({
      ...prev,
      phase: prev.puzzles.finalDecision.endingId ? 'ending' : 'investigation',
      openingRevealed: true,
      lastUpdated: new Date().toISOString(),
    }));
  }, [triggerSound]);

  const handleResumeSaved = useCallback(() => {
    triggerSound('open');
    setShowOpeningScreen(false);
    setGameState((prev) => ({
      ...prev,
      phase: prev.puzzles.finalDecision.endingId ? 'ending' : 'investigation',
      lastUpdated: new Date().toISOString(),
    }));
  }, [triggerSound]);

  const handleOpenEvidence = useCallback(
    (evidenceId: string) => {
      triggerSound('open');
      setGameState((prev) => {
        if (!prev.discoveredEvidenceIds.includes(evidenceId)) return prev;
        return {
          ...prev,
          selectedEvidenceId: evidenceId,
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [triggerSound]
  );

  const handleCloseEvidence = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      selectedEvidenceId: null,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const handleToggleInvestigated = useCallback(
    (evidenceId: string) => {
      triggerSound('clue');
      setGameState((prev) => {
        const exists = prev.investigatedEvidenceIds.includes(evidenceId);
        const nextInvestigated = exists
          ? prev.investigatedEvidenceIds.filter((id) => id !== evidenceId)
          : [...prev.investigatedEvidenceIds, evidenceId];

        const nextChapter: 1 | 2 | 3 | 4 =
          prev.puzzles.decoder.solved &&
          prev.puzzles.timeline.solved &&
          nextInvestigated.includes('ev-sealed-message')
            ? 4
            : prev.chapter;

        return {
          ...prev,
          chapter: nextChapter,
          investigatedEvidenceIds: nextInvestigated,
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [triggerSound]
  );

  const handleInspectAnnotation = useCallback(
    (annotationId: string, evidenceId: string) => {
      triggerSound('clue');
      setGameState((prev) => {
        const nextAnnotations = prev.discoveredAnnotationIds.includes(annotationId)
          ? prev.discoveredAnnotationIds
          : [...prev.discoveredAnnotationIds, annotationId];

        const nextInvestigated = prev.investigatedEvidenceIds.includes(evidenceId)
          ? prev.investigatedEvidenceIds
          : [...prev.investigatedEvidenceIds, evidenceId];

        const nextChapter: 1 | 2 | 3 | 4 =
          prev.puzzles.decoder.solved &&
          prev.puzzles.timeline.solved &&
          nextInvestigated.includes('ev-sealed-message')
            ? 4
            : prev.chapter;

        return {
          ...prev,
          chapter: nextChapter,
          discoveredAnnotationIds: nextAnnotations,
          investigatedEvidenceIds: nextInvestigated,
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [triggerSound]
  );

  const handleAttemptDecode = useCallback(
    (input: string, isCorrect: boolean) => {
      triggerSound(isCorrect ? 'unlock' : 'error');
      setGameState((prev) => {
        const nextDiscovered =
          isCorrect && !prev.discoveredEvidenceIds.includes('ev-recovered-audio')
            ? [...prev.discoveredEvidenceIds, 'ev-recovered-audio']
            : prev.discoveredEvidenceIds;

        const nextChapter: 1 | 2 | 3 | 4 = isCorrect
          ? prev.puzzles.timeline.solved
            ? 3
            : 2
          : prev.chapter;

        return {
          ...prev,
          chapter: nextChapter,
          discoveredEvidenceIds: nextDiscovered,
          puzzles: {
            ...prev.puzzles,
            decoder: {
              ...prev.puzzles.decoder,
              solved: prev.puzzles.decoder.solved || isCorrect,
              attempts: prev.puzzles.decoder.attempts + 1,
              lastInput: input,
            },
          },
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [triggerSound]
  );

  const handleRequestDecoderHint = useCallback(() => {
    triggerSound('tick');
    setGameState((prev) => ({
      ...prev,
      puzzles: {
        ...prev.puzzles,
        decoder: {
          ...prev.puzzles.decoder,
          hintsUsed: Math.min(3, prev.puzzles.decoder.hintsUsed + 1),
        },
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, [triggerSound]);

  const handleUpdateTimelineOrder = useCallback(
    (newOrder: string[]) => {
      triggerSound('tick');
      setGameState((prev) => ({
        ...prev,
        puzzles: {
          ...prev.puzzles,
          timeline: {
            ...prev.puzzles.timeline,
            currentOrder: newOrder,
          },
        },
        lastUpdated: new Date().toISOString(),
      }));
    },
    [triggerSound]
  );

  const handleAttemptTimelineSubmit = useCallback(
    (order: string[], isCorrect: boolean) => {
      triggerSound(isCorrect ? 'unlock' : 'error');
      setGameState((prev) => {
        const nextDiscovered =
          isCorrect && !prev.discoveredEvidenceIds.includes('ev-sealed-message')
            ? [...prev.discoveredEvidenceIds, 'ev-sealed-message']
            : prev.discoveredEvidenceIds;

        const nextChapter: 1 | 2 | 3 | 4 = isCorrect ? 3 : prev.chapter;

        return {
          ...prev,
          chapter: nextChapter,
          discoveredEvidenceIds: nextDiscovered,
          puzzles: {
            ...prev.puzzles,
            timeline: {
              ...prev.puzzles.timeline,
              solved: prev.puzzles.timeline.solved || isCorrect,
              attempts: prev.puzzles.timeline.attempts + 1,
              currentOrder: order,
            },
          },
          lastUpdated: new Date().toISOString(),
        };
      });
    },
    [triggerSound]
  );

  const handleRequestTimelineHint = useCallback(() => {
    triggerSound('tick');
    setGameState((prev) => ({
      ...prev,
      puzzles: {
        ...prev.puzzles,
        timeline: {
          ...prev.puzzles.timeline,
          hintsUsed: Math.min(3, prev.puzzles.timeline.hintsUsed + 1),
        },
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, [triggerSound]);

  const handleExecuteDirective = useCallback(
    (choiceId: string, endingId: EndingId) => {
      triggerSound('transmit');
      setGameState((prev) => ({
        ...prev,
        phase: 'ending',
        chapter: 4,
        puzzles: {
          ...prev.puzzles,
          finalDecision: {
            selectedChoiceId: choiceId,
            endingId,
          },
        },
        lastUpdated: new Date().toISOString(),
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [triggerSound]
  );

  const handleReturnToDecision = useCallback(() => {
    triggerSound('open');
    setShowOpeningScreen(false);
    setGameState((prev) => ({
      ...prev,
      phase: 'investigation',
      activeTab: 'decision',
      puzzles: {
        ...prev.puzzles,
        finalDecision: {
          ...prev.puzzles.finalDecision,
          endingId: null,
        },
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, [triggerSound]);

  const handleConfirmResetCase = useCallback(() => {
    clearSavedGameState();
    const fresh = createInitialGameState();
    setGameState(fresh);
    setShowResetConfirm(false);
    setShowOpeningScreen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const objectives = useMemo(() => deriveObjectives(gameState), [gameState]);
  const completedObjectivesCount = useMemo(
    () => objectives.filter((o) => o.completed).length,
    [objectives]
  );

  const activeChapter = CHAPTERS[gameState.chapter];
  const selectedEvidence = useMemo(
    () =>
      gameState.selectedEvidenceId
        ? EVIDENCE_ITEMS.find((item) => item.id === gameState.selectedEvidenceId) ?? null
        : null,
    [gameState.selectedEvidenceId]
  );

  const hasCipherClue =
    gameState.discoveredAnnotationIds.includes('ann-note-cipher') ||
    gameState.discoveredAnnotationIds.includes('ann-radio-shift') ||
    gameState.investigatedEvidenceIds.includes('ev-handwritten-note');

  const totalAnnotations = useMemo(
    () => EVIDENCE_ITEMS.reduce((acc, item) => acc + item.annotations.length, 0),
    []
  );

  // 1. Opening Transmission Screen
  if (showOpeningScreen || gameState.phase === 'opening') {
    return (
      <OpeningTransmission
        openingRevealed={gameState.openingRevealed}
        hasSavedSession={hasSavedProgress(savedOnBoot)}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={handleToggleSound}
        onRevealHeadline={handleRevealOpeningHeadline}
        onEnterWorkspace={handleEnterWorkspace}
        onResumeSaved={handleResumeSaved}
        onPlayTick={() => triggerSound('tick')}
      />
    );
  }

  // 2. Completed Ending View
  if (gameState.phase === 'ending' && gameState.puzzles.finalDecision.endingId) {
    return (
      <>
        <EndingView
          endingId={gameState.puzzles.finalDecision.endingId}
          investigatedCount={gameState.investigatedEvidenceIds.length}
          discoveredAnnotationsCount={gameState.discoveredAnnotationIds.length}
          hintsUsedTotal={
            gameState.puzzles.decoder.hintsUsed + gameState.puzzles.timeline.hintsUsed
          }
          soundEnabled={gameState.soundEnabled}
          onToggleSound={handleToggleSound}
          onReturnToDecision={handleReturnToDecision}
          onRequestReplayReset={() => setShowResetConfirm(true)}
        />
        {showResetConfirm && (
          <ResetConfirmationModal
            onCancel={() => setShowResetConfirm(false)}
            onConfirm={handleConfirmResetCase}
          />
        )}
      </>
    );
  }

  // 3. Main Investigation Workspace
  return (
    <div className="min-h-screen bg-[#090B0A] text-[#E2DFD7] flex flex-col justify-between scanline-overlay">
      {/* Strict 3-Zone Top Navigation Bar */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-[#0C100E] border-b border-[#1E2722]">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setShowOpeningScreen(true)}
          className="text-base sm:text-lg font-editorial font-semibold tracking-tight text-[#F2ECE1] hover:text-[#8AB896] transition-colors whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B]"
        >
          THE LAST SIGNAL
        </button>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Investigation sections"
          className="hidden md:flex items-center gap-6 text-xs font-terminal"
        >
          <button
            type="button"
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'archive' }))
            }
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              gameState.activeTab === 'archive'
                ? 'border-[#6E9E7B] text-[#F2ECE1] font-semibold'
                : 'border-transparent text-[#8C968E] hover:text-[#EAE4D7]'
            }`}
          >
            Evidence Archive ({gameState.discoveredEvidenceIds.length}/{EVIDENCE_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'decoder' }))
            }
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              gameState.activeTab === 'decoder'
                ? 'border-[#6E9E7B] text-[#F2ECE1] font-semibold'
                : 'border-transparent text-[#8C968E] hover:text-[#EAE4D7]'
            }`}
          >
            Transmission Decoder {gameState.puzzles.decoder.solved ? '✓' : ''}
          </button>
          <button
            type="button"
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'timeline' }))
            }
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              gameState.activeTab === 'timeline'
                ? 'border-[#6E9E7B] text-[#F2ECE1] font-semibold'
                : 'border-transparent text-[#8C968E] hover:text-[#EAE4D7]'
            }`}
          >
            Station Timeline {gameState.puzzles.timeline.solved ? '✓' : ''}
          </button>
          <button
            type="button"
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'decision' }))
            }
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              gameState.activeTab === 'decision'
                ? 'border-[#6E9E7B] text-[#F2ECE1] font-semibold'
                : 'border-transparent text-[#8C968E] hover:text-[#EAE4D7]'
            }`}
          >
            Final Directive
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-1.5 text-xs font-terminal text-[#EAE4D7] bg-[#161D19] hover:bg-[#222D27] border border-[#2C3A32] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
          >
            Restart Case
          </button>
        </div>
      </header>

      {/* Main Workspace Container (1440px baseline) */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Narrative Chapter Banner & Telemetry Toolbar */}
        <section
          aria-label="Current investigation chapter narrative"
          className="bg-[#0D1210] border border-[#243029] p-5 sm:p-7 mb-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#1A231E] text-xs font-terminal text-[#8C968E]">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
              <span>{STATION_METADATA.stationId}</span>
              <span className="text-[#3E4A42]">·</span>
              <span className="text-[#8AB896]">{activeChapter.subtitle}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleSound}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-terminal text-[#A3ADA5] hover:text-[#EAE4D7] border border-[#232E28] transition-colors whitespace-nowrap shrink-0"
                aria-pressed={gameState.soundEnabled}
              >
                {gameState.soundEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
                    <span>Sound: On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#737D76]" aria-hidden="true" />
                    <span>Sound: Muted</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowOpeningScreen(true)}
                className="px-2.5 py-1 text-xs font-terminal text-[#A3ADA5] hover:text-[#EAE4D7] border border-[#232E28] transition-colors whitespace-nowrap shrink-0"
              >
                View Opening Transmission
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3">
              <h1 className="font-editorial text-2xl sm:text-3xl text-[#F2ECE1] font-normal">
                {activeChapter.title}
              </h1>
              <div className="space-y-2.5 text-sm text-[#B8C2BA] leading-relaxed max-w-3xl">
                {activeChapter.narrative.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#090D0B] border border-[#1E2822] p-4 font-terminal text-xs space-y-3">
              <div className="flex items-center justify-between text-[#8AB896]">
                <span>OPERATOR BRIEFING</span>
                <span>CHAPTER 0{gameState.chapter}/04</span>
              </div>
              <p className="text-[#C5D1C7] leading-relaxed">{activeChapter.promptNote}</p>
              <div className="pt-2 border-t border-[#18201B] flex items-center justify-between text-[11px] text-[#7D8780]">
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
                  <span>
                    Clues Verified: {gameState.discoveredAnnotationIds.length}/{totalAnnotations}
                  </span>
                </span>
                <span>
                  Investigated: {gameState.investigatedEvidenceIds.length}/
                  {EVIDENCE_ITEMS.length}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile / Tablet Accessible Workspace Tabs */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 md:hidden"
          role="tablist"
          aria-label="Workspace sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={gameState.activeTab === 'archive'}
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'archive' }))
            }
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-terminal border transition-colors whitespace-nowrap ${
              gameState.activeTab === 'archive'
                ? 'bg-[#6E9E7B] text-[#090B0A] border-[#6E9E7B] font-semibold'
                : 'bg-[#0E1311] text-[#B8C2BA] border-[#243029]'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Archive ({gameState.discoveredEvidenceIds.length})</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={gameState.activeTab === 'decoder'}
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'decoder' }))
            }
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-terminal border transition-colors whitespace-nowrap ${
              gameState.activeTab === 'decoder'
                ? 'bg-[#6E9E7B] text-[#090B0A] border-[#6E9E7B] font-semibold'
                : 'bg-[#0E1311] text-[#B8C2BA] border-[#243029]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Decoder {gameState.puzzles.decoder.solved ? '✓' : ''}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={gameState.activeTab === 'timeline'}
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'timeline' }))
            }
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-terminal border transition-colors whitespace-nowrap ${
              gameState.activeTab === 'timeline'
                ? 'bg-[#6E9E7B] text-[#090B0A] border-[#6E9E7B] font-semibold'
                : 'bg-[#0E1311] text-[#B8C2BA] border-[#243029]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Timeline {gameState.puzzles.timeline.solved ? '✓' : ''}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={gameState.activeTab === 'decision'}
            onClick={() =>
              setGameState((prev) => ({ ...prev, activeTab: 'decision' }))
            }
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-terminal border transition-colors whitespace-nowrap ${
              gameState.activeTab === 'decision'
                ? 'bg-[#6E9E7B] text-[#090B0A] border-[#6E9E7B] font-semibold'
                : 'bg-[#0E1311] text-[#B8C2BA] border-[#243029]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Directive</span>
          </button>
        </div>

        {/* Two-Column Investigation Grid: Main Workspace (8 cols) + Objectives & Case Timeline Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Active Tool Column */}
          <div className="lg:col-span-8">
            {gameState.activeTab === 'archive' && (
              <EvidenceArchive
                evidenceItems={EVIDENCE_ITEMS}
                discoveredEvidenceIds={gameState.discoveredEvidenceIds}
                investigatedEvidenceIds={gameState.investigatedEvidenceIds}
                discoveredAnnotationIds={gameState.discoveredAnnotationIds}
                activeFilter={gameState.evidenceFilter}
                onFilterChange={(filter: 'all' | EvidenceType) =>
                  setGameState((prev) => ({ ...prev, evidenceFilter: filter }))
                }
                onOpenEvidence={handleOpenEvidence}
                onNavigateTab={(tab: WorkspaceTab) =>
                  setGameState((prev) => ({ ...prev, activeTab: tab }))
                }
              />
            )}

            {gameState.activeTab === 'decoder' && (
              <DecoderPuzzle
                solved={gameState.puzzles.decoder.solved}
                attempts={gameState.puzzles.decoder.attempts}
                lastInput={gameState.puzzles.decoder.lastInput}
                hintsUsed={gameState.puzzles.decoder.hintsUsed}
                hasCipherClue={hasCipherClue}
                onAttemptDecode={handleAttemptDecode}
                onRequestHint={handleRequestDecoderHint}
                onOpenEvidence={handleOpenEvidence}
                onProceedToTimeline={() =>
                  setGameState((prev) => ({ ...prev, activeTab: 'timeline' }))
                }
              />
            )}

            {gameState.activeTab === 'timeline' && (
              <TimelinePuzzle
                solved={gameState.puzzles.timeline.solved}
                attempts={gameState.puzzles.timeline.attempts}
                currentOrder={gameState.puzzles.timeline.currentOrder}
                hintsUsed={gameState.puzzles.timeline.hintsUsed}
                decoderSolved={gameState.puzzles.decoder.solved}
                onUpdateOrder={handleUpdateTimelineOrder}
                onAttemptSubmit={handleAttemptTimelineSubmit}
                onRequestHint={handleRequestTimelineHint}
                onOpenEvidence={handleOpenEvidence}
                onProceedToDecision={() =>
                  setGameState((prev) => ({ ...prev, activeTab: 'decision' }))
                }
              />
            )}

            {gameState.activeTab === 'decision' && (
              <FinalDecisionPanel
                decoderSolved={gameState.puzzles.decoder.solved}
                timelineSolved={gameState.puzzles.timeline.solved}
                investigatedEvidenceIds={gameState.investigatedEvidenceIds}
                discoveredAnnotationIds={gameState.discoveredAnnotationIds}
                selectedChoiceId={gameState.puzzles.finalDecision.selectedChoiceId}
                onSelectEvidence={handleOpenEvidence}
                onNavigateTab={(tab: WorkspaceTab) =>
                  setGameState((prev) => ({ ...prev, activeTab: tab }))
                }
                onExecuteDirective={handleExecuteDirective}
              />
            )}
          </div>

          {/* Right Sidebar: Compact Objectives Panel & Case Timeline Summary */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Objectives Panel */}
            <section
              aria-label="Investigation objectives"
              className="bg-[#0D110F] border border-[#232F28] p-5"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1B251F] text-xs font-terminal">
                <span className="uppercase tracking-wider text-[#EAE4D7] font-semibold">
                  Case Objectives
                </span>
                <span className="text-[#6E9E7B] tabular-nums">
                  {completedObjectivesCount}/{objectives.length} Completed
                </span>
              </div>

              <div className="space-y-2.5">
                {objectives.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => {
                      if (obj.targetEvidenceId && gameState.discoveredEvidenceIds.includes(obj.targetEvidenceId)) {
                        handleOpenEvidence(obj.targetEvidenceId);
                      } else if (obj.targetTab) {
                        setGameState((prev) => ({
                          ...prev,
                          activeTab: obj.targetTab!,
                        }));
                      }
                    }}
                    className={`w-full text-left p-3 border transition-colors flex items-start gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] ${
                      obj.completed
                        ? 'bg-[#0A0E0C] border-[#1A231E] text-[#7D8780]'
                        : obj.active
                        ? 'bg-[#121B16] border-[#384F41] text-[#EAE4D7]'
                        : 'bg-[#0B0F0D] border-[#1B231F] text-[#9AA69E]'
                    }`}
                  >
                    {obj.completed ? (
                      <CheckCircle2
                        className="w-4 h-4 text-[#6E9E7B] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          obj.active ? 'text-[#E0A96D]' : 'text-[#525C55]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <div className="space-y-1 min-w-0">
                      <div
                        className={`text-xs font-terminal font-medium ${
                          obj.completed ? 'line-through text-[#7D8780]' : 'text-[#EAE4D7]'
                        }`}
                      >
                        {obj.label}
                      </div>
                      <p className="text-[11px] text-[#8C968E] leading-relaxed">
                        {obj.detail}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Case Timeline Summary Rail */}
            <section
              aria-label="Blackout Night Case Timeline"
              className="bg-[#0D110F] border border-[#232F28] p-5"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1B251F] text-xs font-terminal">
                <span className="uppercase tracking-wider text-[#EAE4D7] font-semibold">
                  Station Chronology
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setGameState((prev) => ({ ...prev, activeTab: 'timeline' }))
                  }
                  className="text-[#8AB896] hover:underline whitespace-nowrap"
                >
                  {gameState.puzzles.timeline.solved ? 'Verified ✓' : 'Reconstruct →'}
                </button>
              </div>

              <div className="space-y-3 font-terminal text-xs">
                {(gameState.puzzles.timeline.solved
                  ? [...TIMELINE_EVENTS].sort((a, b) => a.correctIndex - b.correctIndex)
                  : gameState.puzzles.timeline.currentOrder
                      .map((id) => TIMELINE_EVENTS.find((e) => e.id === id))
                      .filter((e): e is typeof TIMELINE_EVENTS[0] => Boolean(e))
                ).map((evt, idx) => (
                  <div
                    key={evt.id}
                    className="p-2.5 bg-[#090C0A] border border-[#19221D] flex items-start gap-2.5"
                  >
                    <span className="text-[#6E9E7B] font-semibold shrink-0 tabular-nums">
                      {gameState.puzzles.timeline.solved
                        ? evt.revealedTimeAfterSolve
                        : `SLOT 0${idx + 1}`}
                    </span>
                    <span className="text-[#B8C2BA] leading-snug">{evt.title}</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Quiet Archival Footer */}
      <footer className="w-full max-w-[1380px] mx-auto px-6 py-4 border-t border-[#151B18] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-terminal text-[#677069]">
        <div>
          <span>THE LAST SIGNAL · OUTPOST VESPER-9 ARCHIVAL TERMINAL</span>
          <span className="mx-2">·</span>
          <span>PROGRESS STORED IN LOCAL BROWSER BUFFER</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowOpeningScreen(true)}
            className="hover:text-[#B8C2BA] transition-colors whitespace-nowrap"
          >
            Replay Intro Transmission
          </button>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1 text-[#D46B5A] hover:underline whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>Reset Case</span>
          </button>
        </div>
      </footer>

      {/* Immersive Evidence Detail Viewer Modal */}
      {selectedEvidence && (
        <EvidenceViewerModal
          evidence={selectedEvidence}
          allEvidence={EVIDENCE_ITEMS}
          discoveredEvidenceIds={gameState.discoveredEvidenceIds}
          investigatedEvidenceIds={gameState.investigatedEvidenceIds}
          discoveredAnnotationIds={gameState.discoveredAnnotationIds}
          onClose={handleCloseEvidence}
          onToggleInvestigated={handleToggleInvestigated}
          onInspectAnnotation={handleInspectAnnotation}
          onSelectConnectedEvidence={handleOpenEvidence}
          onJumpToDecoder={() => {
            handleCloseEvidence();
            setGameState((prev) => ({ ...prev, activeTab: 'decoder' }));
          }}
        />
      )}

      {/* Confirmation Dialog before Erasing Progress */}
      {showResetConfirm && (
        <ResetConfirmationModal
          onCancel={() => setShowResetConfirm(false)}
          onConfirm={handleConfirmResetCase}
        />
      )}
    </div>
  );
}

interface ResetConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md bg-[#0E1311] border border-[#B84A39] p-6 space-y-5 shadow-2xl">
        <div className="flex items-center gap-3 text-[#D46B5A]">
          <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <h2 id="reset-dialog-title" className="text-sm font-terminal uppercase tracking-wider">
            Confirm Case Reset
          </h2>
        </div>

        <p className="text-sm text-[#C2CCC4] leading-relaxed">
          Restarting the investigation will erase your local browser progress, including solved
          puzzles, unlocked transmissions, verified annotations, and endings.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-terminal text-[#EAE4D7] bg-[#161D19] hover:bg-[#222D27] border border-[#2D3B33] transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-terminal font-medium text-[#090B0A] bg-[#D46B5A] hover:bg-[#E27B6B] transition-colors whitespace-nowrap"
          >
            Erase Progress &amp; Restart Case
          </button>
        </div>
      </div>
    </div>
  );
};
