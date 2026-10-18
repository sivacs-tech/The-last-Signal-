import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Search,
  Link2,
  Lock,
  Radio,
  FileText,
  Terminal,
  Camera,
  Activity,
  Mic,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { EvidenceItem } from '../types/mystery';

interface EvidenceViewerModalProps {
  evidence: EvidenceItem;
  allEvidence: EvidenceItem[];
  discoveredEvidenceIds: string[];
  investigatedEvidenceIds: string[];
  discoveredAnnotationIds: string[];
  onClose: () => void;
  onToggleInvestigated: (evidenceId: string) => void;
  onInspectAnnotation: (annotationId: string, evidenceId: string) => void;
  onSelectConnectedEvidence: (evidenceId: string) => void;
  onJumpToDecoder: () => void;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  evidence,
  allEvidence,
  discoveredEvidenceIds,
  investigatedEvidenceIds,
  discoveredAnnotationIds,
  onClose,
  onToggleInvestigated,
  onInspectAnnotation,
  onSelectConnectedEvidence,
  onJumpToDecoder,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
    evidence.annotations[0]?.id ?? null
  );
  const [imageError, setImageError] = useState(false);

  const isInvestigated = investigatedEvidenceIds.includes(evidence.id);

  // Sync default selected annotation when switching between connected evidence items
  useEffect(() => {
    setImageError(false);
    if (evidence.annotations.length > 0) {
      const firstId = evidence.annotations[0].id;
      setActiveAnnotationId(firstId);
    } else {
      setActiveAnnotationId(null);
    }
  }, [evidence.id, evidence.annotations]);

  // Manage focus and lock background scroll while open
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [onClose]);

  const handleSelectAnnotation = (annId: string) => {
    setActiveAnnotationId(annId);
    onInspectAnnotation(annId, evidence.id);
  };

  const activeAnnotation =
    evidence.annotations.find((a) => a.id === activeAnnotationId) ?? evidence.annotations[0];

  const inspectedCountForThisItem = evidence.annotations.filter((a) =>
    discoveredAnnotationIds.includes(a.id)
  ).length;

  const getTypeIcon = () => {
    switch (evidence.type) {
      case 'transmission':
        return <Radio className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#C8B99E]" aria-hidden="true" />;
      case 'log':
        return <Terminal className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />;
      case 'photograph':
        return <Camera className="w-4 h-4 text-[#8AB896]" aria-hidden="true" />;
      case 'report':
        return <Activity className="w-4 h-4 text-[#D46B5A]" aria-hidden="true" />;
      case 'audio-transcript':
        return <Mic className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />;
      case 'sealed-message':
        return <ShieldAlert className="w-4 h-4 text-[#D46B5A]" aria-hidden="true" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-viewer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl bg-[#0D110F] border border-[#2C3A32] text-[#E2DFD7] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Archival Header Bar */}
        <div className="px-5 py-4 bg-[#111714] border-b border-[#243029] flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {getTypeIcon()}
            <div className="text-xs font-terminal text-[#8C968E] truncate">
              <span className="text-[#EAE4D7] font-semibold">{evidence.code}</span>
              <span className="mx-2 text-[#45524A]">·</span>
              <span className="uppercase">{evidence.type.replace('-', ' ')}</span>
              <span className="mx-2 text-[#45524A]">·</span>
              <span>{evidence.timestamp}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleInvestigated(evidence.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-terminal border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0 ${
                isInvestigated
                  ? 'bg-[#192820] border-[#6E9E7B] text-[#98C9A6]'
                  : 'bg-[#141A17] border-[#2E3C34] text-[#C2CCC4] hover:border-[#6E9E7B]'
              }`}
            >
              {isInvestigated ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
                  <span>Marked Investigated</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-[#7D8780]" aria-hidden="true" />
                  <span>Mark as Investigated</span>
                </>
              )}
            </button>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal bg-[#181F1B] hover:bg-[#232E28] text-[#EAE4D7] border border-[#2E3C34] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
              aria-label="Close evidence viewer"
            >
              <span>Close [ESC]</span>
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
          {/* Title & Provenance Metadata */}
          <div className="border-b border-[#1E2722] pb-5">
            <div className="text-xs font-terminal text-[#7D8780] mb-1">
              SOURCE PROVENANCE: {evidence.source}
            </div>
            <h2
              id="evidence-viewer-title"
              className="font-editorial text-2xl sm:text-3xl text-[#F2ECE1] font-normal"
            >
              {evidence.title}
            </h2>
            <p className="mt-2 text-sm text-[#A9B3AB] leading-relaxed max-w-3xl">
              {evidence.summary}
            </p>
          </div>

          {/* Evidence-Type Adaptive Primary Presentation */}
          {evidence.type === 'document' && (
            <div className="archival-paper p-6 sm:p-8 border border-[#BFB6A4] shadow-inner">
              <div className="flex items-center justify-between border-b border-[#1C1A17]/20 pb-3 mb-5 text-xs font-terminal text-[#4A453D]">
                <span>VESPER-9 FIELD NOTEBOOK · SCANner REF #42-B</span>
                <span>INK LOG: DR. ELENA VANCE</span>
              </div>
              <div className="space-y-4 font-editorial text-base sm:text-lg leading-relaxed text-[#1E1B18] max-w-2xl">
                {evidence.bodyText.map((paragraph, idx) => (
                  <p key={idx} className={idx === 0 ? 'font-semibold text-sm uppercase tracking-wider font-terminal text-[#5A3E36]' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-[#1C1A17]/20 flex flex-wrap items-center justify-between gap-3 text-xs font-terminal text-[#6B2D23]">
                <span>MARGIN ANNOTATION DETECTED: CAESAR SHIFT (+3 / -3)</span>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectAnnotation('ann-note-cipher');
                    onJumpToDecoder();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1A17] text-[#EAE4D7] hover:bg-[#33302B] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Open in Transmission Decoder</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {evidence.type === 'transmission' && (
            <div className="bg-[#080B09] border border-[#26362C] p-5 sm:p-6 font-terminal">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[#1A261F] text-xs text-[#6E9E7B]">
                <span>RAW TELEMETRY FRAME // 300 BAUD AFSK</span>
                <span>CARRIER BLEED: 14.208 Hz</span>
              </div>
              <div className="space-y-3 text-xs sm:text-sm text-[#C4D1C7]">
                {evidence.bodyText.map((line, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border ${
                      line.includes('SCRAMBLED STREAM B')
                        ? 'bg-[#131D17] border-[#6E9E7B] text-[#EAE4D7]'
                        : 'bg-[#0C100E] border-[#1A231E]'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
              {evidence.cipherSnippet && (
                <div className="mt-5 p-4 bg-[#121A15] border border-[#32473A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-[#8AB896] uppercase tracking-wider">
                      Intercepted Cipher Block
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-[#F2ECE1] tracking-widest mt-1">
                      {evidence.cipherSnippet}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onJumpToDecoder}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-terminal font-medium bg-[#6E9E7B] text-[#080A09] hover:bg-[#82B38F] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Send to Decoder Tool</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}

          {evidence.type === 'log' && evidence.logRows && (
            <div className="bg-[#090D0B] border border-[#243029] overflow-x-auto">
              <div className="px-4 py-3 bg-[#101613] border-b border-[#243029] flex items-center justify-between text-xs font-terminal text-[#8C968E]">
                <span>NON-VOLATILE RFID &amp; HATCH SENSOR LEDGER</span>
                <span>CHRONOLOGY REFERENCE</span>
              </div>
              <table className="w-full text-left border-collapse font-terminal text-xs">
                <thead>
                  <tr className="border-b border-[#1F2923] text-[#7D8780] bg-[#0C110E]">
                    <th className="py-3 px-4">UTC TIME</th>
                    <th className="py-3 px-4">SECTOR</th>
                    <th className="py-3 px-4">BADGE / ACTOR</th>
                    <th className="py-3 px-4">HARDWARE EVENT</th>
                    <th className="py-3 px-4">STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18201B]">
                  {evidence.logRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#121915]">
                      <td className="py-3 px-4 text-[#EAE4D7] font-semibold whitespace-nowrap">
                        {row.timestamp}
                      </td>
                      <td className="py-3 px-4 text-[#9FB0A4] whitespace-nowrap">{row.sector}</td>
                      <td className="py-3 px-4 text-[#C2CCC4] whitespace-nowrap">{row.actor}</td>
                      <td className="py-3 px-4 text-[#D0D8D2]">{row.event}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={
                            row.status === 'ALERT'
                              ? 'text-[#D46B5A] font-semibold'
                              : row.status === 'OVERRIDE'
                              ? 'text-[#E0A96D] font-semibold'
                              : 'text-[#6E9E7B]'
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {evidence.type === 'photograph' && (
            <div className="space-y-3">
              <div className="relative bg-[#070908] border border-[#2C3A32] overflow-hidden">
                {/* Top camera telemetry banner */}
                <div className="px-4 py-2 bg-[#0C100E]/95 border-b border-[#222D27] flex flex-wrap items-center justify-between gap-2 text-xs font-terminal text-[#8AB896]">
                  <span>CAM-04 OPTICAL/THERMAL COMPOSITE · FICTIONAL RECONSTRUCTION</span>
                  <span>CLICK NUMBERED PINS ON FRAME TO INSPECT TRACES</span>
                </div>

                <div className="relative aspect-16/9 w-full bg-[#0A0E0C] overflow-hidden">
                  {!imageError && evidence.imageUrl ? (
                    <img
                      src={evidence.imageUrl}
                      alt={evidence.imageAlt || evidence.title}
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                      className="w-full h-full object-cover opacity-55 contrast-125 grayscale"
                    />
                  ) : null}

                  {/* Architectural & Thermal Forensic SVG Overlay (also serves as full visual fallback) */}
                  <svg
                    viewBox="0 0 800 450"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    aria-hidden="true"
                  >
                    <defs>
                      <radialGradient id="thermalGlow" cx="24%" cy="42%" r="16%">
                        <stop offset="0%" stopColor="#D46B5A" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#D46B5A" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* Corridor perspective lines */}
                    <line x1="0" y1="0" x2="260" y2="150" stroke="#6E9E7B" strokeOpacity="0.3" strokeWidth="1" />
                    <line x1="800" y1="0" x2="540" y2="150" stroke="#6E9E7B" strokeOpacity="0.3" strokeWidth="1" />
                    <line x1="0" y1="450" x2="260" y2="310" stroke="#6E9E7B" strokeOpacity="0.3" strokeWidth="1" />
                    <line x1="800" y1="450" x2="540" y2="310" stroke="#6E9E7B" strokeOpacity="0.3" strokeWidth="1" />
                    <rect x="260" y="150" width="280" height="160" fill="none" stroke="#6E9E7B" strokeOpacity="0.35" strokeWidth="1.5" />
                    {/* Airlock wheel schematic on left wall */}
                    <circle cx="192" cy="189" r="34" fill="url(#thermalGlow)" stroke="#D46B5A" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="4 2" />
                    {/* Boot print vector path on floor */}
                    <path d="M 350 380 L 430 330 L 490 295" fill="none" stroke="#8AB896" strokeOpacity="0.65" strokeWidth="2" strokeDasharray="6 6" />
                    {/* Sheared cable trunk upper right */}
                    <path d="M 590 130 L 645 165" fill="none" stroke="#D46B5A" strokeOpacity="0.7" strokeWidth="2" />
                    {/* Reticle crosshairs */}
                    <line x1="400" y1="215" x2="400" y2="235" stroke="#6E9E7B" strokeOpacity="0.4" />
                    <line x1="390" y1="225" x2="410" y2="225" stroke="#6E9E7B" strokeOpacity="0.4" />
                  </svg>

                  {/* Measured contrast scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                  {/* Interactive Forensic Coordinate Pins */}
                  {evidence.annotations.map((ann, idx) => {
                    if (!ann.coordinates) return null;
                    const isSelected = activeAnnotation?.id === ann.id;
                    const isVerified = discoveredAnnotationIds.includes(ann.id);
                    return (
                      <button
                        key={ann.id}
                        type="button"
                        onClick={() => handleSelectAnnotation(ann.id)}
                        style={{
                          left: `${ann.coordinates.x}%`,
                          top: `${ann.coordinates.y}%`,
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-terminal font-semibold border transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EAE4D7] whitespace-nowrap ${
                          isSelected
                            ? 'bg-[#D46B5A] text-[#090B0A] border-[#F2ECE1] scale-105'
                            : isVerified
                            ? 'bg-[#17261D]/95 text-[#98C9A6] border-[#6E9E7B]'
                            : 'bg-[#0D120F]/95 text-[#EAE4D7] border-[#D46B5A]'
                        }`}
                      >
                        PIN 0{idx + 1}
                      </button>
                    );
                  })}
                </div>

                {evidence.imageCaption && (
                  <div className="px-4 py-2.5 bg-[#0C100E] border-t border-[#1E2722] text-xs font-terminal text-[#8C968E]">
                    {evidence.imageCaption}
                  </div>
                )}
              </div>
            </div>
          )}

          {evidence.type === 'report' && evidence.powerRows && (
            <div className="bg-[#090D0B] border border-[#243029] overflow-x-auto">
              <div className="px-4 py-3 bg-[#101613] border-b border-[#243029] flex items-center justify-between text-xs font-terminal text-[#8C968E]">
                <span>SUBSTATION D SOLID-STATE METERING AUDIT</span>
                <span>RESERVE BATTERY: 91% (44.2H REMAINING)</span>
              </div>
              <table className="w-full text-left border-collapse font-terminal text-xs">
                <thead>
                  <tr className="border-b border-[#1F2923] text-[#7D8780] bg-[#0C110E]">
                    <th className="py-3 px-4">STATION SUBSYSTEM</th>
                    <th className="py-3 px-4 text-right">18:00 UTC (kW)</th>
                    <th className="py-3 px-4 text-right">22:30 UTC (kW)</th>
                    <th className="py-3 px-4">DIAGNOSTIC STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#18201B]">
                  {evidence.powerRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#121915]">
                      <td className="py-3 px-4 text-[#EAE4D7] font-medium">{row.subsystem}</td>
                      <td className="py-3 px-4 text-right text-[#9FB0A4] tabular-nums">
                        {row.baselineKw.toFixed(1)} kW
                      </td>
                      <td className="py-3 px-4 text-right text-[#EAE4D7] font-semibold tabular-nums">
                        {row.postBlackoutKw.toFixed(1)} kW
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            row.status.includes('OVERDRIVE')
                              ? 'text-[#D46B5A] font-semibold'
                              : row.status.includes('STABLE')
                              ? 'text-[#6E9E7B]'
                              : 'text-[#C2CCC4]'
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {evidence.type === 'audio-transcript' && evidence.transcriptLines && (
            <div className="bg-[#0B0F0D] border border-[#26342C] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1B2620] text-xs font-terminal text-[#6E9E7B]">
                <span>VOICE RECORDER LOOP #19 · CONDENSER MIC CAPTURE</span>
                <span>DURATION: 36M 18S (EXCERPTED)</span>
              </div>
              <div className="space-y-4">
                {evidence.transcriptLines.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#101613] border border-[#1E2923] space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-terminal">
                      <span
                        className={
                          item.speaker.includes('THORNE')
                            ? 'text-[#E0A96D] font-semibold'
                            : 'text-[#8AB896] font-semibold'
                        }
                      >
                        {item.speaker}
                      </span>
                      <span className="text-[#737D76]">
                        {item.timecode} UTC {item.tone ? `· (${item.tone})` : ''}
                      </span>
                    </div>
                    <p className="font-editorial text-base text-[#EAE4D7] leading-relaxed">
                      “{item.text}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {evidence.type === 'sealed-message' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 bg-[#101714] border border-[#2E4236] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-terminal text-[#8AB896] uppercase tracking-wider mb-2">
                    CHANNEL ALPHA · DR. ELENA VANCE
                  </div>
                  <p className="font-editorial text-sm sm:text-base text-[#EAE4D7] leading-relaxed">
                    {evidence.bodyText[1]}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1F2D25] text-xs font-terminal text-[#8C968E]">
                  REQUESTS: WIDEBAND RELAY + IMMEDIATE ICEBREAKER EXTRACTION
                </div>
              </div>

              <div className="p-5 bg-[#161211] border border-[#4A2C26] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-terminal text-[#D46B5A] uppercase tracking-wider mb-2">
                    CHANNEL BETA · ENG. MARCUS THORNE
                  </div>
                  <p className="font-editorial text-sm sm:text-base text-[#EAE4D7] leading-relaxed">
                    {evidence.bodyText[3]}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#33201C] text-xs font-terminal text-[#B89A94]">
                  REQUESTS: HIGH-VOLTAGE INDUCTIVE PURGE + QUARANTINE
                </div>
              </div>
            </div>
          )}

          {/* Interactive Forensic Annotations Section */}
          <div className="bg-[#101513] border border-[#25322B] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />
                <h3 className="text-xs font-terminal uppercase tracking-wider text-[#EAE4D7]">
                  Forensic Annotations &amp; Closer Inspection ({inspectedCountForThisItem}/
                  {evidence.annotations.length} Verified)
                </h3>
              </div>
              <span className="text-xs font-terminal text-[#7D8780]">
                Select each annotation to record its clue in your case file
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Annotation selector buttons */}
              <div className="md:col-span-5 space-y-2">
                {evidence.annotations.map((ann) => {
                  const isSelected = activeAnnotation?.id === ann.id;
                  const isDiscovered = discoveredAnnotationIds.includes(ann.id);
                  return (
                    <button
                      key={ann.id}
                      type="button"
                      onClick={() => handleSelectAnnotation(ann.id)}
                      className={`w-full text-left p-3 border text-xs font-terminal transition-colors flex items-center justify-between gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] ${
                        isSelected
                          ? 'bg-[#18231D] border-[#6E9E7B] text-[#F2ECE1]'
                          : 'bg-[#0C100E] border-[#1F2923] text-[#A9B3AB] hover:border-[#3A4D41]'
                      }`}
                    >
                      <span className="truncate">{ann.label}</span>
                      <span
                        className={`text-[11px] shrink-0 ${
                          isDiscovered ? 'text-[#6E9E7B]' : 'text-[#D46B5A]'
                        }`}
                      >
                        {isDiscovered ? 'VERIFIED' : 'INSPECT'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active annotation detail pane */}
              <div className="md:col-span-7 bg-[#0B0F0D] border border-[#1E2822] p-4 flex flex-col justify-between">
                {activeAnnotation ? (
                  <div>
                    <div className="text-xs font-terminal text-[#6E9E7B] mb-2">
                      EXTRACTED TRACE: {activeAnnotation.excerpt}
                    </div>
                    <p className="text-sm text-[#D5DDD7] leading-relaxed">
                      {activeAnnotation.analysis}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-terminal text-[#7D8780]">
                    Select an annotation on the left to inspect its forensic analysis.
                  </p>
                )}

                {activeAnnotation && !discoveredAnnotationIds.includes(activeAnnotation.id) && (
                  <div className="mt-4 pt-3 border-t border-[#18201B] flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectAnnotation(activeAnnotation.id)}
                      className="px-3 py-1.5 text-xs font-terminal bg-[#6E9E7B] text-[#090B0A] font-medium hover:bg-[#82B38F] transition-colors whitespace-nowrap shrink-0"
                    >
                      Verify &amp; Log Clue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Connected Evidence Cross-References */}
          <div className="border-t border-[#1E2722] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-terminal text-[#8C968E]">
              <Link2 className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />
              <span>CROSS-REFERENCED FILES:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {evidence.connectedEvidenceIds.map((connId) => {
                const target = allEvidence.find((item) => item.id === connId);
                if (!target) return null;
                const isUnlocked = discoveredEvidenceIds.includes(target.id);
                return (
                  <button
                    key={target.id}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) onSelectConnectedEvidence(target.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal border transition-colors whitespace-nowrap shrink-0 ${
                      isUnlocked
                        ? 'bg-[#121815] border-[#2C3A32] text-[#D0D8D2] hover:border-[#6E9E7B] hover:text-white'
                        : 'bg-[#0C0F0E] border-[#1A211D] text-[#5C665F] cursor-not-allowed'
                    }`}
                  >
                    {!isUnlocked && <Lock className="w-3 h-3" aria-hidden="true" />}
                    <span>
                      {target.code}: {target.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
