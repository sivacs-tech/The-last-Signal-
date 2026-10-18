export type EvidenceType =
  | 'transmission'
  | 'document'
  | 'log'
  | 'photograph'
  | 'report'
  | 'audio-transcript'
  | 'sealed-message';

export type EndingId = 'rescue' | 'containment' | 'unresolved';

export type GamePhase = 'opening' | 'investigation' | 'ending';

export type WorkspaceTab = 'archive' | 'decoder' | 'timeline' | 'decision';

export interface EvidenceAnnotation {
  id: string;
  label: string;
  coordinates?: { x: number; y: number }; // Percentage coordinates for photo/schematic pins
  excerpt: string;
  analysis: string;
}

export interface EvidenceLogRow {
  timestamp: string;
  sector: string;
  actor: string;
  event: string;
  status: 'NOMINAL' | 'ALERT' | 'OVERRIDE' | 'REDACTED';
}

export interface PowerLoadRow {
  subsystem: string;
  baselineKw: number;
  postBlackoutKw: number;
  status: string;
}

export interface TranscriptLine {
  timecode: string;
  speaker: string;
  text: string;
  tone?: string;
}

export interface EvidenceItem {
  id: string;
  code: string;
  title: string;
  shortDescription: string;
  type: EvidenceType;
  timestamp: string;
  source: string;
  initiallyUnlocked: boolean;
  unlockConditionText: string;
  summary: string;
  bodyText: string[];
  cipherSnippet?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  logRows?: EvidenceLogRow[];
  powerRows?: PowerLoadRow[];
  transcriptLines?: TranscriptLine[];
  annotations: EvidenceAnnotation[];
  connectedEvidenceIds: string[];
}

export interface TimelineEventItem {
  id: string;
  correctIndex: number;
  code: string;
  title: string;
  description: string;
  sourceClue: string;
  revealedTimeAfterSolve: string;
}

export interface FinalChoiceOption {
  id: string;
  title: string;
  subtitle: string;
  alignedWith: string;
  directiveCode: string;
  summary: string;
  supportingEvidenceIds: string[];
  consequencePreview: string;
  targetEndingId: EndingId;
}

export interface EndingData {
  id: EndingId;
  code: string;
  title: string;
  subtitle: string;
  classification: string;
  leadQuote: string;
  narrativeParagraphs: string[];
  deepClueParagraph: string;
  shallowClueParagraph: string;
  finalStatusReport: {
    stationStatus: string;
    crewFate: string;
    signalDisposition: string;
    archivalVerdict: string;
  };
}

export interface ChapterData {
  number: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  narrative: string[];
  promptNote: string;
}

export interface ObjectiveItem {
  id: string;
  label: string;
  detail: string;
  completed: boolean;
  active: boolean;
  targetTab?: WorkspaceTab;
  targetEvidenceId?: string;
}

export interface GameState {
  version: number;
  phase: GamePhase;
  openingRevealed: boolean;
  chapter: 1 | 2 | 3 | 4;
  discoveredEvidenceIds: string[];
  investigatedEvidenceIds: string[];
  discoveredAnnotationIds: string[];
  selectedEvidenceId: string | null;
  activeTab: WorkspaceTab;
  evidenceFilter: 'all' | EvidenceType;
  puzzles: {
    decoder: {
      solved: boolean;
      attempts: number;
      lastInput: string;
      hintsUsed: number;
    };
    timeline: {
      solved: boolean;
      attempts: number;
      currentOrder: string[];
      hintsUsed: number;
    };
    finalDecision: {
      selectedChoiceId: string | null;
      endingId: EndingId | null;
    };
  };
  soundEnabled: boolean;
  lastUpdated: string;
}
