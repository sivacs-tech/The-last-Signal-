import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  FileText,
  Radio,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { EVIDENCE_ITEMS, FINAL_CHOICES } from '../data/storyData';
import { EndingId, WorkspaceTab } from '../types/mystery';

interface FinalDecisionPanelProps {
  decoderSolved: boolean;
  timelineSolved: boolean;
  investigatedEvidenceIds: string[];
  discoveredAnnotationIds: string[];
  selectedChoiceId: string | null;
  onSelectEvidence: (evidenceId: string) => void;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onExecuteDirective: (choiceId: string, endingId: EndingId) => void;
}

export const FinalDecisionPanel: React.FC<FinalDecisionPanelProps> = ({
  decoderSolved,
  timelineSolved,
  investigatedEvidenceIds,
  discoveredAnnotationIds,
  selectedChoiceId,
  onSelectEvidence,
  onNavigateTab,
  onExecuteDirective,
}) => {
  const [activeOptionId, setActiveOptionId] = useState<string>(
    selectedChoiceId || FINAL_CHOICES[0].id
  );

  const totalAnnotations = EVIDENCE_ITEMS.reduce(
    (acc, item) => acc + item.annotations.length,
    0
  );

  const isUnlocked = decoderSolved && timelineSolved;

  if (!isUnlocked) {
    return (
      <div className="bg-[#0E1311] border border-[#243029] p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#1D2621]">
          <Lock className="w-5 h-5 text-[#D46B5A]" aria-hidden="true" />
          <div>
            <h2 className="text-xs font-terminal uppercase tracking-wider text-[#EAE4D7]">
              Puzzle 03 · Final Relay Directive (Locked)
            </h2>
            <p className="text-xs text-[#8C968E] mt-0.5">
              Complete both preliminary verification stages to unseal Directive OMEGA-9.
            </p>
          </div>
        </div>

        <p className="text-sm text-[#B8C2BA] leading-relaxed max-w-2xl">
          Relay Echo-1 cannot transmit an emergency directive to Outpost Vesper-9 until the
          secondary burst stream has been decoded and the station’s blackout night timeline has
          been verified against hardware logs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0A0E0C] border border-[#222D27] flex flex-col justify-between gap-4">
            <div>
              <div className="text-xs font-terminal text-[#7D8780] mb-1">PREREQUISITE 01</div>
              <div className="text-sm font-medium text-[#F2ECE1]">
                Decode the Secondary Transmission Burst
              </div>
              <div className="text-xs font-terminal mt-2">
                {decoderSolved ? (
                  <span className="text-[#6E9E7B]">COMPLETED</span>
                ) : (
                  <span className="text-[#E0A96D]">PENDING DECRYPTION</span>
                )}
              </div>
            </div>
            {!decoderSolved && (
              <button
                type="button"
                onClick={() => onNavigateTab('decoder')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-terminal bg-[#161F1A] hover:bg-[#202E26] text-[#EAE4D7] border border-[#2E3E35] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Decoder Tab</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="p-4 bg-[#0A0E0C] border border-[#222D27] flex flex-col justify-between gap-4">
            <div>
              <div className="text-xs font-terminal text-[#7D8780] mb-1">PREREQUISITE 02</div>
              <div className="text-sm font-medium text-[#F2ECE1]">
                Reconstruct the Blackout Night Timeline
              </div>
              <div className="text-xs font-terminal mt-2">
                {timelineSolved ? (
                  <span className="text-[#6E9E7B]">COMPLETED</span>
                ) : (
                  <span className="text-[#E0A96D]">PENDING CHRONOLOGY</span>
                )}
              </div>
            </div>
            {!timelineSolved && (
              <button
                type="button"
                onClick={() => onNavigateTab('timeline')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-terminal bg-[#161F1A] hover:bg-[#202E26] text-[#EAE4D7] border border-[#2E3E35] transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Timeline Tab</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const selectedOption =
    FINAL_CHOICES.find((c) => c.id === activeOptionId) ?? FINAL_CHOICES[0];

  return (
    <div className="space-y-6">
      {/* Conflicting Testimony Banner */}
      <div className="bg-[#0E1311] border border-[#243029] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1D2621]">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#D46B5A]" aria-hidden="true" />
            <h2 className="text-xs font-terminal uppercase tracking-wider text-[#EAE4D7]">
              Puzzle 03 · Conflicting Evidence &amp; Final Relay Directive
            </h2>
          </div>
          <div className="text-xs font-terminal text-[#8AB896]">
            DIRECTIVE OMEGA-9 UNSEALED · AWAITING OPERATOR COMMAND
          </div>
        </div>

        <p className="text-sm text-[#C2CCC4] leading-relaxed mb-5">
          Outpost Vesper-9’s command buffer holds two conflicting emergency appeals—one from{' '}
          <strong className="text-[#EAE4D7]">Dr. Elena Vance</strong> inside the bolted Comms Bridge, and one injected
          by <strong className="text-[#EAE4D7]">Engineer Marcus Thorne</strong> from Substation D. Review the
          contradictions below, choose which interpretation of the evidence you trust, and transmit
          your final directive.
        </p>

        {/* Forensic Readiness Bar */}
        <div className="p-4 bg-[#0A0E0C] border border-[#212C25] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-terminal text-[#EAE4D7]">
              <Eye className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
              <span>
                CLOSER LOOK DEPTH: {investigatedEvidenceIds.length}/{EVIDENCE_ITEMS.length} Files
                Marked Investigated · {discoveredAnnotationIds.length}/{totalAnnotations} Forensic
                Annotations Verified
              </span>
            </div>
            <p className="text-xs text-[#8C968E]">
              Inspecting more annotations in the Archive unlocks deeper forensic conclusions in your
              final report.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelectEvidence('ev-sealed-message')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-terminal bg-[#141D18] hover:bg-[#1D2A23] text-[#EAE4D7] border border-[#2E3E35] transition-colors whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
            <span>Inspect EV-07 (Directive OMEGA-9)</span>
          </button>
        </div>

        {/* Three Directive Choices */}
        <div className="space-y-4" role="radiogroup" aria-label="Final directive interpretations">
          {FINAL_CHOICES.map((option) => {
            const isSelected = option.id === activeOptionId;
            return (
              <div
                key={option.id}
                onClick={() => setActiveOptionId(option.id)}
                className={`p-5 border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#131D18] border-[#6E9E7B]'
                    : 'bg-[#0A0D0C] border-[#1F2923] hover:border-[#35463C]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="final-directive-choice"
                      id={option.id}
                      checked={isSelected}
                      onChange={() => setActiveOptionId(option.id)}
                      className="accent-[#6E9E7B] w-4 h-4"
                    />
                    <label
                      htmlFor={option.id}
                      className="text-xs font-terminal uppercase tracking-wider text-[#8AB896] cursor-pointer"
                    >
                      {option.directiveCode}
                    </label>
                  </div>
                  <span className="text-xs font-terminal text-[#8C968E]">
                    Aligned with: {option.alignedWith}
                  </span>
                </div>

                <h3 className="font-editorial text-lg sm:text-xl text-[#F2ECE1] mb-1.5">
                  {option.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#B8C2BA] leading-relaxed mb-4">
                  {option.summary}
                </p>

                <div className="pt-3 border-t border-[#1D2721] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-terminal">
                  <div className="text-[#9AA69E]">
                    <span className="text-[#7D8780]">PROJECTED OUTCOME: </span>
                    {option.consequencePreview}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {option.supportingEvidenceIds.map((evId) => {
                      const ev = EVIDENCE_ITEMS.find((item) => item.id === evId);
                      if (!ev) return null;
                      return (
                        <button
                          key={evId}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvidence(evId);
                          }}
                          className="px-2 py-1 bg-[#0D120F] hover:bg-[#1A241E] border border-[#28362E] text-[#A9B8AE] transition-colors whitespace-nowrap"
                        >
                          {ev.code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm & Transmit Directive Button */}
        <div className="mt-6 pt-5 border-t border-[#1E2822] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs font-terminal text-[#9AA69E]">
            <span>SELECTED COMMAND: </span>
            <strong className="text-[#EAE4D7]">{selectedOption.directiveCode}</strong>
          </div>
          <button
            type="button"
            onClick={() =>
              onExecuteDirective(selectedOption.id, selectedOption.targetEndingId)
            }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-terminal font-medium bg-[#EAE4D7] text-[#090B0A] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
          >
            <Radio className="w-4 h-4 text-[#090B0A]" aria-hidden="true" />
            <span>Transmit Final Directive to Vesper-9</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
