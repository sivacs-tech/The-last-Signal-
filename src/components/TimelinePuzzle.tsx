import React, { useState } from 'react';
import {
  Clock,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Unlock,
  ArrowRight,
} from 'lucide-react';
import {
  TIMELINE_EVENTS,
  TIMELINE_HINTS,
  validateTimelineOrder,
} from '../data/storyData';
import { TimelineEventItem } from '../types/mystery';

interface TimelinePuzzleProps {
  solved: boolean;
  attempts: number;
  currentOrder: string[];
  hintsUsed: number;
  decoderSolved: boolean;
  onUpdateOrder: (newOrder: string[]) => void;
  onAttemptSubmit: (order: string[], isCorrect: boolean) => void;
  onRequestHint: () => void;
  onOpenEvidence: (evidenceId: string) => void;
  onProceedToDecision: () => void;
}

export const TimelinePuzzle: React.FC<TimelinePuzzleProps> = ({
  solved,
  attempts,
  currentOrder,
  hintsUsed,
  decoderSolved,
  onUpdateOrder,
  onAttemptSubmit,
  onRequestHint,
  onOpenEvidence,
  onProceedToDecision,
}) => {
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: solved ? 'success' : null,
    message: solved
      ? 'CHRONOLOGY VERIFIED: All 5 blackout night events aligned with hardware logs. Directive OMEGA-9 (EV-07) has been unsealed.'
      : '',
  });

  const orderedEvents: TimelineEventItem[] = currentOrder
    .map((id) => TIMELINE_EVENTS.find((item) => item.id === id))
    .filter((item): item is TimelineEventItem => Boolean(item));

  const moveItem = (index: number, direction: -1 | 1) => {
    if (solved) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;
    const nextOrder = [...currentOrder];
    const [removed] = nextOrder.splice(index, 1);
    nextOrder.splice(targetIndex, 0, removed);
    onUpdateOrder(nextOrder);
  };

  const handleVerifyOrder = () => {
    const isCorrect = validateTimelineOrder(currentOrder);
    onAttemptSubmit(currentOrder, isCorrect);

    if (isCorrect) {
      setFeedback({
        type: 'success',
        message:
          'CHRONOLOGY LOCKED: Your reconstruction proves that Engineer Thorne tripped the main breaker at 21:40 UTC to stop the borehole winch, Dr. Vance bolted the bridge at 22:10 UTC to amplify the projector, and the 23:05 UTC airlock cycle was staged from inside.',
      });
    } else {
      const correctPositions = orderedEvents.filter(
        (evt, idx) => evt.correctIndex === idx
      ).length;
      setFeedback({
        type: 'error',
        message: `SEQUENCE DISCREPANCY (${correctPositions} of ${orderedEvents.length} events in their exact chronological slot). Cross-reference EV-02 (Dr. Vance’s Note), EV-03 (Mainframe Access Log), and EV-06 (Bridge Voice Recorder).`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Instructions */}
      <div className="bg-[#0E1311] border border-[#243029] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1D2621]">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />
            <h2 className="text-xs font-terminal uppercase tracking-wider text-[#EAE4D7]">
              Puzzle 02 · Blackout Night Timeline Reconstruction
            </h2>
          </div>
          <div className="text-xs font-terminal text-[#8C968E]">
            <span>STATUS: </span>
            <span className={solved ? 'text-[#6E9E7B] font-semibold' : 'text-[#E0A96D]'}>
              {solved ? 'CHRONOLOGY VERIFIED' : 'SEQUENCE CORRUPTED'}
            </span>
            <span className="mx-2 text-[#3F4A43]">·</span>
            <span>ATTEMPTS: {attempts}</span>
          </div>
        </div>

        <p className="text-sm text-[#B8C2BA] leading-relaxed mb-4">
          Arrange the five blackout night events from <strong className="text-[#EAE4D7]">earliest (Position 01)</strong> to{' '}
          <strong className="text-[#EAE4D7]">latest (Position 05)</strong> using the Up and Down controls. Once the
          station’s true causal sequence is restored, the checksum lock on Directive OMEGA-9 (EV-07) will open.
        </p>

        {/* Quick Evidence Reference Links */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <button
            type="button"
            onClick={() => onOpenEvidence('ev-access-log')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal bg-[#141C18] hover:bg-[#1C2822] text-[#C5D1C7] border border-[#2A3830] transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
            <span>EV-03: Access Log</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenEvidence('ev-handwritten-note')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal bg-[#141C18] hover:bg-[#1C2822] text-[#C5D1C7] border border-[#2A3830] transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
            <span>EV-02: Vance’s Note</span>
          </button>
          {decoderSolved && (
            <button
              type="button"
              onClick={() => onOpenEvidence('ev-recovered-audio')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal bg-[#141C18] hover:bg-[#1C2822] text-[#C5D1C7] border border-[#2A3830] transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
              <span>EV-06: Voice Recorder</span>
            </button>
          )}
        </div>

        {/* Reorderable Event List */}
        <div className="space-y-3" role="list" aria-label="Chronological events list">
          {orderedEvents.map((evt, index) => {
            const isCorrectSlot = solved && evt.correctIndex === index;
            return (
              <div
                key={evt.id}
                role="listitem"
                className={`p-4 border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCorrectSlot
                    ? 'bg-[#121D16] border-[#6E9E7B]'
                    : 'bg-[#0A0E0C] border-[#222D27] hover:border-[#34463C]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="font-terminal text-xs font-semibold px-2.5 py-1.5 bg-[#141B17] border border-[#2B3831] text-[#8AB896] shrink-0 tabular-nums">
                    0{index + 1}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-terminal">
                      <span className="text-[#7D8780]">{evt.code}</span>
                      {solved && (
                        <>
                          <span className="text-[#45524A]">·</span>
                          <span className="text-[#6E9E7B] font-semibold">
                            VERIFIED TIME: {evt.revealedTimeAfterSolve}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-medium text-[#F2ECE1]">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-[#9AA69E] leading-relaxed">{evt.description}</p>
                  </div>
                </div>

                {/* Accessible Up / Down Reordering Controls */}
                {!solved && (
                  <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                      aria-label={`Move "${evt.title}" earlier to position ${index}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-terminal bg-[#151D19] hover:bg-[#1E2A24] disabled:opacity-35 disabled:pointer-events-none text-[#EAE4D7] border border-[#2D3B33] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap"
                    >
                      <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Up</span>
                    </button>
                    <button
                      type="button"
                      disabled={index === orderedEvents.length - 1}
                      onClick={() => moveItem(index, 1)}
                      aria-label={`Move "${evt.title}" later to position ${index + 2}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-terminal bg-[#151D19] hover:bg-[#1E2A24] disabled:opacity-35 disabled:pointer-events-none text-[#EAE4D7] border border-[#2D3B33] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap"
                    >
                      <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Down</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit / Verify Control */}
        {!solved && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleVerifyOrder}
              className="px-6 py-2.5 text-xs sm:text-sm font-terminal font-medium bg-[#6E9E7B] text-[#080A09] hover:bg-[#82B38F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EAE4D7] whitespace-nowrap shrink-0"
            >
              Verify Chronological Sequence
            </button>
          </div>
        )}

        {/* Feedback & Causal Significance Explanation */}
        {feedback.type && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-6 p-5 border text-xs sm:text-sm font-terminal flex items-start gap-3 ${
              feedback.type === 'success'
                ? 'bg-[#132219] border-[#6E9E7B] text-[#C8E6D0]'
                : 'bg-[#1F1311] border-[#B84A39] text-[#EBB8B0]'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#6E9E7B] shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-[#D46B5A] shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="space-y-3 flex-1">
              <p className="leading-relaxed">{feedback.message}</p>
              {solved && (
                <div className="pt-2 border-t border-[#274232] space-y-3">
                  <p className="text-xs text-[#A5C9B0] leading-relaxed">
                    WHY THIS ORDER MATTERS: Because the 23:05 UTC Airlock cycle happened 55 minutes{' '}
                    <em>after</em> Dr. Vance bolted herself in the Comms Bridge and 10 minutes after
                    Thorne &amp; Kael retreated to the Sector A medical pod, neither group evacuated
                    the station. Both factions are still inside Vesper-9 right now.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenEvidence('ev-sealed-message')}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-terminal font-medium bg-[#EAE4D7] text-[#090B0A] hover:bg-white transition-colors whitespace-nowrap shrink-0"
                    >
                      <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open Unsealed File: EV-07 (Directive OMEGA-9)</span>
                    </button>
                    <button
                      type="button"
                      onClick={onProceedToDecision}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-terminal font-medium bg-[#1C2A22] text-[#EAE4D7] border border-[#6E9E7B] hover:bg-[#25382D] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Proceed to Final Directive</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Staged Hint System */}
      <div className="bg-[#0D110F] border border-[#212B25] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#8C968E]" aria-hidden="true" />
            <h3 className="text-xs font-terminal uppercase tracking-wider text-[#C2CCC4]">
              Chronology Hints ({hintsUsed}/{TIMELINE_HINTS.length} Revealed)
            </h3>
          </div>
          {hintsUsed < TIMELINE_HINTS.length && !solved && (
            <button
              type="button"
              onClick={onRequestHint}
              className="px-3.5 py-1.5 text-xs font-terminal bg-[#161D19] hover:bg-[#202A24] text-[#EAE4D7] border border-[#2D3B33] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
            >
              Reveal Hint {hintsUsed + 1} of {TIMELINE_HINTS.length}
            </button>
          )}
        </div>

        {hintsUsed > 0 && (
          <div className="mt-4 space-y-2.5 border-t border-[#1B231E] pt-4">
            {TIMELINE_HINTS.slice(0, hintsUsed).map((hintText, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#111714] border border-[#233028] text-xs font-terminal text-[#B8C4BA] leading-relaxed"
              >
                {hintText}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
