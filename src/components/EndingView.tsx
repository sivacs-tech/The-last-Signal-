import React from 'react';
import {
  RotateCcw,
  ArrowLeft,
  Radio,
  CheckCircle2,
  Eye,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ENDINGS, EVIDENCE_ITEMS, STATION_METADATA } from '../data/storyData';
import { EndingId } from '../types/mystery';

interface EndingViewProps {
  endingId: EndingId;
  investigatedCount: number;
  discoveredAnnotationsCount: number;
  hintsUsedTotal: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReturnToDecision: () => void;
  onRequestReplayReset: () => void;
}

export const EndingView: React.FC<EndingViewProps> = ({
  endingId,
  investigatedCount,
  discoveredAnnotationsCount,
  hintsUsedTotal,
  soundEnabled,
  onToggleSound,
  onReturnToDecision,
  onRequestReplayReset,
}) => {
  const ending = ENDINGS[endingId];
  const totalEvidence = EVIDENCE_ITEMS.length;
  const totalAnnotations = EVIDENCE_ITEMS.reduce(
    (acc, item) => acc + item.annotations.length,
    0
  );

  // If the investigator examined at least 5 files or 8+ forensic annotations, they unlock the deep forensic epilogue
  const unlockedDeepVerdict =
    investigatedCount >= 5 || discoveredAnnotationsCount >= 8;

  return (
    <div className="min-h-screen bg-[#080A09] text-[#E2DFD7] flex flex-col justify-between scanline-overlay">
      {/* Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 border-b border-[#1D2420] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 font-terminal text-xs text-[#8C968E]">
          <Radio className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />
          <span>{STATION_METADATA.relayTerminal} · FINAL TRANSMISSION LOGGED</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-terminal text-[#A3ADA5] hover:text-[#EAE4D7] border border-[#232C27] hover:border-[#6E9E7B]/50 transition-colors whitespace-nowrap shrink-0"
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
                <span>Audio: On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#78827A]" aria-hidden="true" />
                <span>Audio: Muted</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onReturnToDecision}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-terminal text-[#EAE4D7] bg-[#141C18] hover:bg-[#1E2A24] border border-[#2D3C33] transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Explore Other Endings</span>
          </button>
        </div>
      </header>

      {/* Main Ending Dossier */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-10 space-y-8 signal-interference">
        {/* Classification Header */}
        <div className="border-b border-[#222C26] pb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-terminal text-[#6E9E7B] uppercase tracking-widest mb-2">
            <span>{ending.code}</span>
            <span>{ending.classification}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-5xl text-[#F2ECE1] font-normal tracking-tight mb-3">
            {ending.title}
          </h1>
          <p className="text-sm sm:text-base text-[#A8B3AA]">{ending.subtitle}</p>
        </div>

        {/* Pull Quote */}
        <blockquote className="py-5 border-y border-[#1F2923] font-editorial italic text-xl sm:text-2xl text-[#E5DFD2] leading-relaxed">
          {ending.leadQuote}
        </blockquote>

        {/* Primary Branching Narrative */}
        <div className="space-y-5 font-editorial text-base sm:text-lg text-[#D8D4CA] leading-relaxed max-w-3xl">
          {ending.narrativeParagraphs.map((para, idx) => (
            <p
              key={idx}
              className={
                idx === 0
                  ? 'first-letter:text-4xl first-letter:font-semibold first-letter:mr-2 first-letter:text-[#F2ECE1]'
                  : ''
              }
            >
              {para}
            </p>
          ))}
        </div>

        {/* "A Story That Changes When You Look Closer" Forensic Epilogue Block */}
        <div
          className={`p-6 border ${
            unlockedDeepVerdict
              ? 'bg-[#101914] border-[#6E9E7B]'
              : 'bg-[#141210] border-[#4A3728]'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-terminal uppercase tracking-wider mb-2">
            <Eye
              className={`w-4 h-4 ${
                unlockedDeepVerdict ? 'text-[#6E9E7B]' : 'text-[#E0A96D]'
              }`}
              aria-hidden="true"
            />
            <span className={unlockedDeepVerdict ? 'text-[#8AB896]' : 'text-[#E0A96D]'}>
              {unlockedDeepVerdict
                ? 'Closer Look Forensic Synthesis Unlocked'
                : 'Partial Forensic Inspection Note'}
            </span>
          </div>
          <p className="text-sm text-[#D5DDD7] leading-relaxed">
            {unlockedDeepVerdict ? ending.deepClueParagraph : ending.shallowClueParagraph}
          </p>
        </div>

        {/* Official Post-Incident Status Report */}
        <section
          aria-label="Official Post-Incident Status Report"
          className="bg-[#0C100E] border border-[#222D27] p-6"
        >
          <h2 className="text-xs font-terminal uppercase tracking-wider text-[#8C968E] pb-3 mb-4 border-b border-[#1B241F]">
            POST-INCIDENT ARCHIVAL LEDGER · CASE #V9-1018
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-terminal text-xs">
            <div className="p-3.5 bg-[#090C0A] border border-[#19211C]">
              <dt className="text-[#737D76] mb-1">OUTPOST VESPER-9 STATUS</dt>
              <dd className="text-[#EAE4D7] font-medium">
                {ending.finalStatusReport.stationStatus}
              </dd>
            </div>
            <div className="p-3.5 bg-[#090C0A] border border-[#19211C]">
              <dt className="text-[#737D76] mb-1">RESEARCH CREW DISPOSITION</dt>
              <dd className="text-[#EAE4D7] font-medium">
                {ending.finalStatusReport.crewFate}
              </dd>
            </div>
            <div className="p-3.5 bg-[#090C0A] border border-[#19211C]">
              <dt className="text-[#737D76] mb-1">14.2 Hz SIGNAL CONTAINMENT</dt>
              <dd className="text-[#EAE4D7] font-medium">
                {ending.finalStatusReport.signalDisposition}
              </dd>
            </div>
            <div className="p-3.5 bg-[#090C0A] border border-[#19211C]">
              <dt className="text-[#737D76] mb-1">ARCHIVAL VERDICT</dt>
              <dd className="text-[#8AB896] font-medium">
                {ending.finalStatusReport.archivalVerdict}
              </dd>
            </div>
          </dl>

          {/* Investigation Completion Metrics */}
          <div className="mt-4 pt-4 border-t border-[#1B241F] flex flex-wrap items-center justify-between gap-4 text-xs font-terminal text-[#8C968E]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />
              <span>
                Evidence Investigated: {investigatedCount}/{totalEvidence}
              </span>
            </div>
            <div>
              Forensic Annotations Verified: {discoveredAnnotationsCount}/{totalAnnotations}
            </div>
            <div>Hints Used: {hintsUsedTotal}</div>
          </div>
        </section>

        {/* Replay & Outcome Exploration Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={onReturnToDecision}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-terminal font-medium bg-[#151E19] hover:bg-[#1E2B24] text-[#EAE4D7] border border-[#6E9E7B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Return to Final Decision &amp; Try Another Ending</span>
          </button>

          <button
            type="button"
            onClick={onRequestReplayReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-terminal font-medium bg-[#EAE4D7] text-[#090B0A] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Replay Story from Beginning</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-4 border-t border-[#151B18] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-terminal text-[#677069]">
        <span>THE LAST SIGNAL · END OF TRANSMISSION</span>
        <span>3 DETERMINISTIC ENDINGS AVAILABLE: RESCUE · CONTAINMENT · UNRESOLVED</span>
      </footer>
    </div>
  );
};
