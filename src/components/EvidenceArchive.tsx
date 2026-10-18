import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Radio,
  FileText,
  Terminal,
  Camera,
  Activity,
  Mic,
  ShieldAlert,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { EvidenceItem, EvidenceType, WorkspaceTab } from '../types/mystery';

interface EvidenceArchiveProps {
  evidenceItems: EvidenceItem[];
  discoveredEvidenceIds: string[];
  investigatedEvidenceIds: string[];
  discoveredAnnotationIds: string[];
  activeFilter: 'all' | EvidenceType;
  onFilterChange: (filter: 'all' | EvidenceType) => void;
  onOpenEvidence: (evidenceId: string) => void;
  onNavigateTab: (tab: WorkspaceTab) => void;
}

const FILTER_OPTIONS: Array<{ value: 'all' | EvidenceType; label: string }> = [
  { value: 'all', label: 'All Records (7)' },
  { value: 'transmission', label: 'Transmissions' },
  { value: 'document', label: 'Field Notes' },
  { value: 'log', label: 'Access Logs' },
  { value: 'photograph', label: 'Surveillance' },
  { value: 'report', label: 'Power Audit' },
  { value: 'audio-transcript', label: 'Voice Loops' },
  { value: 'sealed-message', label: 'Directives' },
];

export const EvidenceArchive: React.FC<EvidenceArchiveProps> = ({
  evidenceItems,
  discoveredEvidenceIds,
  investigatedEvidenceIds,
  discoveredAnnotationIds,
  activeFilter,
  onFilterChange,
  onOpenEvidence,
  onNavigateTab,
}) => {
  const [thumbErrorMap, setThumbErrorMap] = useState<Record<string, boolean>>({});

  const filteredItems =
    activeFilter === 'all'
      ? evidenceItems
      : evidenceItems.filter((item) => item.type === activeFilter);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-[#0D110F] border border-[#222D27] p-3 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-1"
          role="tablist"
          aria-label="Filter evidence by record type"
        >
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterChange(opt.value)}
                className={`px-3 py-1.5 text-xs font-terminal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#6E9E7B] text-[#080A09] font-semibold'
                    : 'text-[#9AA69E] hover:text-[#EAE4D7] hover:bg-[#151C18]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-terminal text-[#7D8780] px-2">
          Showing {filteredItems.length} of {evidenceItems.length} records
        </div>
      </div>

      {/* Heterogeneous Evidence Archive Layout */}
      <div className="space-y-5">
        {filteredItems.map((item) => {
          const isUnlocked = discoveredEvidenceIds.includes(item.id);
          const isInvestigated = investigatedEvidenceIds.includes(item.id);
          const verifiedAnnotations = item.annotations.filter((a) =>
            discoveredAnnotationIds.includes(a.id)
          ).length;

          // Locked Evidence Treatment
          if (!isUnlocked) {
            const unlockTab: WorkspaceTab =
              item.id === 'ev-recovered-audio' ? 'decoder' : 'timeline';
            return (
              <div
                key={item.id}
                className="bg-[#0A0D0B] border border-dashed border-[#28332D] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-85"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-terminal text-[#D46B5A]">
                    <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{item.code}</span>
                    <span>·</span>
                    <span className="uppercase">{item.type.replace('-', ' ')}</span>
                    <span>·</span>
                    <span>ENCRYPTED PACKET</span>
                  </div>
                  <h3 className="font-editorial text-lg text-[#9AA69E]">{item.title}</h3>
                  <p className="text-xs font-terminal text-[#737D76]">
                    {item.unlockConditionText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigateTab(unlockTab)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-terminal bg-[#141C18] hover:bg-[#1E2A24] text-[#EAE4D7] border border-[#2E3D34] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
                >
                  <span>
                    {unlockTab === 'decoder' ? 'Go to Decoder Puzzle' : 'Go to Timeline Puzzle'}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          }

          // 1. Visual Treatment: Handwritten Field Note Document (Warm Archival Paper Sheet)
          if (item.type === 'document') {
            return (
              <article
                key={item.id}
                onClick={() => onOpenEvidence(item.id)}
                className="archival-paper border border-[#C5B9A5] p-5 sm:p-6 cursor-pointer transition-transform hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1C1A17]/20 text-xs font-terminal text-[#4D473F]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#6B2D23]" aria-hidden="true" />
                    <span className="font-semibold text-[#1C1A17]">{item.code}</span>
                    <span>·</span>
                    <span>FIELD JOURNAL SCAN</span>
                    <span>·</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      Clues: {verifiedAnnotations}/{item.annotations.length}
                    </span>
                    <span className={isInvestigated ? 'text-[#1E5631] font-semibold' : 'text-[#6B2D23]'}>
                      {isInvestigated ? 'INVESTIGATED' : 'UNVERIFIED'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-8 space-y-2">
                    <h3 className="font-editorial text-xl sm:text-2xl text-[#181613] font-normal">
                      {item.title}
                    </h3>
                    <p className="font-editorial italic text-sm sm:text-base text-[#332F2A] leading-relaxed">
                      “{item.bodyText[1]}”
                    </p>
                  </div>
                  <div className="lg:col-span-4 bg-[#DFD7C6] border border-[#BFB49F] p-3.5 font-terminal text-xs text-[#4A251D] flex flex-col justify-between gap-3">
                    <div>
                      <div className="uppercase tracking-wider font-semibold mb-1">
                        Margin Cipher Note
                      </div>
                      <p className="text-[#2C2823]">
                        Contains Chief Engineer Thorne’s +3 / -3 telemetry shift calibration.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEvidence(item.id);
                      }}
                      className="inline-flex items-center justify-between w-full px-3 py-1.5 bg-[#1C1A17] text-[#EAE4D7] hover:bg-[#33302B] transition-colors whitespace-nowrap"
                    >
                      <span>Examine Notebook Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          }

          // 2. Visual Treatment: Surveillance Photograph (Darkroom Contact Print & Reticle)
          if (item.type === 'photograph') {
            return (
              <article
                key={item.id}
                onClick={() => onOpenEvidence(item.id)}
                className="bg-[#0B0E0D] border border-[#2C3A32] hover:border-[#6E9E7B] transition-colors cursor-pointer overflow-hidden"
              >
                <div className="px-5 py-3 bg-[#101613] border-b border-[#222D27] flex flex-wrap items-center justify-between gap-2 text-xs font-terminal text-[#8C968E]">
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-[#8AB896]" aria-hidden="true" />
                    <span className="text-[#EAE4D7] font-semibold">{item.code}</span>
                    <span>·</span>
                    <span>OPTICAL/THERMAL STILL</span>
                    <span>·</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      Forensic Pins: {verifiedAnnotations}/{item.annotations.length}
                    </span>
                    <span className={isInvestigated ? 'text-[#6E9E7B]' : 'text-[#E0A96D]'}>
                      {isInvestigated ? 'INVESTIGATED' : 'INSPECT PINS'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-5 relative aspect-16/10 md:aspect-auto bg-[#070908] border-b md:border-b-0 md:border-r border-[#222D27] overflow-hidden min-h-[180px]">
                    {!thumbErrorMap[item.id] && item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt || item.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setThumbErrorMap((prev) => ({ ...prev, [item.id]: true }))
                        }
                        className="w-full h-full object-cover opacity-50 grayscale contrast-125"
                      />
                    ) : null}
                    <svg
                      viewBox="0 0 400 225"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      aria-hidden="true"
                    >
                      <line x1="0" y1="0" x2="130" y2="75" stroke="#6E9E7B" strokeOpacity="0.35" />
                      <line x1="400" y1="0" x2="270" y2="75" stroke="#6E9E7B" strokeOpacity="0.35" />
                      <rect x="130" y="75" width="140" height="80" fill="none" stroke="#6E9E7B" strokeOpacity="0.4" />
                      <circle cx="96" cy="95" r="14" fill="none" stroke="#D46B5A" strokeWidth="1.5" />
                      <circle cx="212" cy="166" r="14" fill="none" stroke="#8AB896" strokeWidth="1.5" />
                      <circle cx="312" cy="76" r="14" fill="none" stroke="#D46B5A" strokeWidth="1.5" />
                    </svg>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-[11px] font-terminal text-[#8AB896]">
                      CAM-04 · 3 FORENSIC HOTSPOTS
                    </div>
                  </div>

                  <div className="md:col-span-7 p-5 flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-editorial text-xl text-[#F2ECE1]">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-[#A9B3AB] leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#1C2520] text-xs font-terminal">
                      <span className="text-[#8C968E]">SOURCE: {item.source}</span>
                      <span className="inline-flex items-center gap-1 text-[#EAE4D7] font-medium">
                        <span>Open Contact Print</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          }

          // 3. Visual Treatment: Mainframe Access Log or Substation Power Report (Tabular Terminal View)
          if (item.type === 'log' || item.type === 'report') {
            return (
              <article
                key={item.id}
                onClick={() => onOpenEvidence(item.id)}
                className="bg-[#0A0E0C] border border-[#243029] hover:border-[#6E9E7B] transition-colors cursor-pointer p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1B241F] text-xs font-terminal text-[#8C968E]">
                  <div className="flex items-center gap-2">
                    {item.type === 'log' ? (
                      <Terminal className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
                    ) : (
                      <Activity className="w-3.5 h-3.5 text-[#D46B5A]" aria-hidden="true" />
                    )}
                    <span className="text-[#EAE4D7] font-semibold">{item.code}</span>
                    <span>·</span>
                    <span className="uppercase">{item.type} LEDGER</span>
                    <span>·</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      Clues: {verifiedAnnotations}/{item.annotations.length}
                    </span>
                    <span className={isInvestigated ? 'text-[#6E9E7B]' : 'text-[#E0A96D]'}>
                      {isInvestigated ? 'INVESTIGATED' : 'UNVERIFIED'}
                    </span>
                  </div>
                </div>

                <h3 className="font-editorial text-xl text-[#F2ECE1] mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-[#A9B3AB] leading-relaxed mb-4">
                  {item.summary}
                </p>

                {/* Compact inline data preview strip */}
                {item.logRows && (
                  <div className="bg-[#070A08] border border-[#1B241F] p-3 font-terminal text-xs space-y-1.5 mb-3">
                    {item.logRows.slice(0, 3).map((r, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 truncate">
                        <span className="text-[#6E9E7B] shrink-0">{r.timestamp}</span>
                        <span className="text-[#8C968E] shrink-0">{r.sector}</span>
                        <span className="text-[#C2CCC4] truncate">{r.event}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.powerRows && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-terminal text-xs">
                    {item.powerRows.map((pr, i) => (
                      <div key={i} className="p-2.5 bg-[#070A08] border border-[#1B241F]">
                        <div className="text-[11px] text-[#7D8780] truncate">{pr.subsystem}</div>
                        <div className="text-sm font-semibold text-[#EAE4D7] mt-0.5 tabular-nums">
                          {pr.postBlackoutKw.toFixed(1)} kW
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-terminal text-[#8AB896]">
                  <span>Click to inspect full tabular ledger &amp; annotations</span>
                  <span className="inline-flex items-center gap-1 text-[#EAE4D7]">
                    <span>Inspect Ledger</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                </div>
              </article>
            );
          }

          // 4. Visual Treatment: Transmission, Audio Transcript, or Sealed Directive
          return (
            <article
              key={item.id}
              onClick={() => onOpenEvidence(item.id)}
              className="bg-[#0D1210] border border-[#28362E] hover:border-[#6E9E7B] transition-colors cursor-pointer p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#1E2923] text-xs font-terminal text-[#8C968E]">
                <div className="flex items-center gap-2">
                  {item.type === 'transmission' ? (
                    <Radio className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
                  ) : item.type === 'audio-transcript' ? (
                    <Mic className="w-3.5 h-3.5 text-[#8AB896]" aria-hidden="true" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-[#D46B5A]" aria-hidden="true" />
                  )}
                  <span className="text-[#EAE4D7] font-semibold">{item.code}</span>
                  <span>·</span>
                  <span className="uppercase">{item.type.replace('-', ' ')}</span>
                  <span>·</span>
                  <span>{item.timestamp}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>
                    Clues: {verifiedAnnotations}/{item.annotations.length}
                  </span>
                  <span className={isInvestigated ? 'text-[#6E9E7B]' : 'text-[#E0A96D]'}>
                    {isInvestigated ? 'INVESTIGATED' : 'UNVERIFIED'}
                  </span>
                </div>
              </div>

              <h3 className="font-editorial text-xl text-[#F2ECE1] mb-2">{item.title}</h3>
              <p className="text-xs sm:text-sm text-[#B0B9B2] leading-relaxed mb-4">
                {item.summary}
              </p>

              {item.cipherSnippet && (
                <div className="p-3 bg-[#080B09] border border-[#24332A] font-terminal text-xs text-[#EAE4D7] mb-4 flex items-center justify-between gap-2">
                  <span className="tracking-widest truncate">
                    CIPHER: {item.cipherSnippet}
                  </span>
                  <span className="text-[#6E9E7B] shrink-0">CAESAR +3</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-terminal text-[#8C968E]">
                <span className="inline-flex items-center gap-1.5">
                  {isInvestigated ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-[#8AB896]" aria-hidden="true" />
                  )}
                  <span>{item.source}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[#EAE4D7] font-medium">
                  <span>Open Record</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
