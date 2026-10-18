import React, { useEffect, useState } from 'react';
import { Radio, FastForward, ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import {
  OPENING_HEADLINE,
  OPENING_TERMINAL_LINES,
  STATION_METADATA,
} from '../data/storyData';

interface OpeningTransmissionProps {
  openingRevealed: boolean;
  hasSavedSession: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRevealHeadline: () => void;
  onEnterWorkspace: () => void;
  onResumeSaved: () => void;
  onPlayTick: () => void;
}

export const OpeningTransmission: React.FC<OpeningTransmissionProps> = ({
  openingRevealed,
  hasSavedSession,
  soundEnabled,
  onToggleSound,
  onRevealHeadline,
  onEnterWorkspace,
  onResumeSaved,
  onPlayTick,
}) => {
  const [visibleLines, setVisibleLines] = useState<number>(
    openingRevealed ? OPENING_TERMINAL_LINES.length : 1
  );

  const allLinesVisible = visibleLines >= OPENING_TERMINAL_LINES.length;

  useEffect(() => {
    if (openingRevealed) {
      setVisibleLines(OPENING_TERMINAL_LINES.length);
      return;
    }

    if (visibleLines >= OPENING_TERMINAL_LINES.length) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVisibleLines((prev) => Math.min(OPENING_TERMINAL_LINES.length, prev + 1));
      onPlayTick();
    }, 340);

    return () => window.clearTimeout(timer);
  }, [visibleLines, openingRevealed, onPlayTick]);

  const handleShowCompleteText = () => {
    setVisibleLines(OPENING_TERMINAL_LINES.length);
  };

  return (
    <div className="min-h-screen bg-[#080A09] text-[#E2DFD7] flex flex-col justify-between relative scanline-overlay">
      {/* Top utility bar */}
      <header className="w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#1D2420]">
        <div className="flex items-center gap-3 font-terminal text-xs tracking-wider text-[#8C968E]">
          <Radio className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />
          <span>{STATION_METADATA.stationId}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleSound}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-terminal text-[#A3ADA5] hover:text-[#EAE4D7] border border-[#232C27] hover:border-[#6E9E7B]/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
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
            onClick={onEnterWorkspace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal text-[#A3ADA5] hover:text-[#EAE4D7] border border-[#232C27] hover:border-[#6E9E7B]/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
          >
            <FastForward className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Skip Intro</span>
          </button>
        </div>
      </header>

      {/* Main transmission receiver area */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-10 flex flex-col justify-center">
        {/* Saved session resume banner if available */}
        {hasSavedSession && (
          <div className="mb-8 p-4 bg-[#101412] border border-[#2A3630] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs font-terminal text-[#B8C2BA]">
              <span className="text-[#6E9E7B] font-semibold">LOCAL CASE BUFFER FOUND</span>
              <span className="mx-2 text-[#47524B]">·</span>
              <span>Previous investigation progress is stored in this browser.</span>
            </div>
            <button
              type="button"
              onClick={onResumeSaved}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-terminal font-medium bg-[#6E9E7B] text-[#080A09] hover:bg-[#82B38F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EAE4D7] whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Resume Investigation</span>
            </button>
          </div>
        )}

        {/* Signal indicator & incoming transmission status */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1A211D]">
          <div className="flex items-center gap-3">
            {/* Oscilloscope SVG carrier wave */}
            <div
              className="w-24 h-7 bg-[#0D120F] border border-[#26322B] px-1.5 flex items-center"
              aria-hidden="true"
            >
              <svg viewBox="0 0 100 24" className="w-full h-5 stroke-[#6E9E7B] fill-none">
                <path
                  d="M 0 12 L 14 12 L 19 4 L 24 20 L 29 7 L 34 17 L 39 12 L 58 12 L 63 3 L 68 21 L 73 8 L 78 15 L 83 12 L 100 12"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-xs font-terminal tracking-wider uppercase text-[#6E9E7B]">
                INCOMING TRANSMISSION · CARRIER LOCKED
              </div>
              <div className="text-xs font-terminal text-[#7A847D]">
                {STATION_METADATA.coordinates}
              </div>
            </div>
          </div>

          <div className="text-xs font-terminal text-[#B84A39] tracking-wide">
            SILENCE ELAPSED: {STATION_METADATA.blackoutDuration}
          </div>
        </div>

        {/* Terminal log sequence */}
        <section
          aria-label="Incoming transmission terminal log"
          className="bg-[#0C0F0E] border border-[#1E2722] p-5 sm:p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#18201B] text-xs font-terminal text-[#737D76]">
            <span>{STATION_METADATA.relayTerminal}</span>
            <span>{STATION_METADATA.carrierFrequency}</span>
          </div>

          <div className="space-y-2.5 min-h-[168px] font-terminal text-xs sm:text-sm text-[#B8C4BA]">
            {OPENING_TERMINAL_LINES.slice(0, visibleLines).map((line, index) => (
              <div key={line} className="flex items-start gap-3">
                <span className="text-[#56635A] select-none">
                  0{index + 1}
                </span>
                <span
                  className={
                    index === OPENING_TERMINAL_LINES.length - 1
                      ? 'text-[#D46B5A] font-medium'
                      : 'text-[#C5D1C7]'
                  }
                >
                  {line}
                </span>
              </div>
            ))}
          </div>

          {!allLinesVisible && !openingRevealed && (
            <div className="mt-4 pt-3 border-t border-[#18201B] flex items-center justify-between">
              <span className="text-xs font-terminal text-[#737D76]">
                Receiving burst packets ({visibleLines}/{OPENING_TERMINAL_LINES.length})...
              </span>
              <button
                type="button"
                onClick={handleShowCompleteText}
                className="px-3 py-1.5 text-xs font-terminal text-[#EAE4D7] bg-[#171F1B] hover:bg-[#222E28] border border-[#2C3A32] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
              >
                Show Complete Text
              </button>
            </div>
          )}
        </section>

        {/* Action or Revealed Opening Message */}
        {!openingRevealed ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#101513] border border-[#26322B] p-5">
            <div>
              <p className="text-sm font-medium text-[#EAE4D7]">
                Primary payload frame buffered and ready for inspection.
              </p>
              <p className="text-xs text-[#8C968E] mt-0.5">
                Decode the carrier header to view Vesper-9’s emergency message.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setVisibleLines(OPENING_TERMINAL_LINES.length);
                onRevealHeadline();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-terminal font-medium bg-[#6E9E7B] text-[#080A09] hover:bg-[#82B38F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EAE4D7] whitespace-nowrap shrink-0"
            >
              <span>Decode &amp; Read Transmission</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="bg-[#111614] border border-[#34463B] p-6 sm:p-8 signal-interference">
            <div className="text-xs font-terminal uppercase tracking-widest text-[#6E9E7B] mb-3">
              DECODED PRIMARY FRAME · ORIGIN: COMMS BRIDGE CONSOLE
            </div>
            <h1 className="font-editorial text-2xl sm:text-4xl font-normal text-[#F2ECE1] tracking-tight leading-snug mb-4">
              {OPENING_HEADLINE}
            </h1>
            <p className="text-sm text-[#B0B9B2] leading-relaxed max-w-2xl mb-6">
              Attached to this transmission are five station records and a scrambled secondary
              message. Someone inside Outpost Vesper-9 overrode the blackout quarantine to reach
              your terminal—and someone else tried to stop them.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onEnterWorkspace}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-terminal font-medium bg-[#EAE4D7] text-[#090B0A] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
              >
                <span>Begin Investigation</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <span className="text-xs font-terminal text-[#7D8780]">
                5 Evidence Files Buffered · 2 Locked Packets Detected
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Quiet archival footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-4 border-t border-[#151B18] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-terminal text-[#677069]">
        <span>THE LAST SIGNAL · FICTIONAL ARCHIVAL MYSTERY</span>
        <span>KEYBOARD ACCESSIBLE · ESC TO CLOSE FILES</span>
      </footer>
    </div>
  );
};
