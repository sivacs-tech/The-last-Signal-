import React, { useState } from 'react';
import {
  KeyRound,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Unlock,
  ArrowRight,
} from 'lucide-react';
import { DECODER_PUZZLE, validateDecoderAnswer } from '../data/storyData';

interface DecoderPuzzleProps {
  solved: boolean;
  attempts: number;
  lastInput: string;
  hintsUsed: number;
  hasCipherClue: boolean;
  onAttemptDecode: (input: string, isCorrect: boolean) => void;
  onRequestHint: () => void;
  onOpenEvidence: (evidenceId: string) => void;
  onProceedToTimeline: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const DecoderPuzzle: React.FC<DecoderPuzzleProps> = ({
  solved,
  attempts,
  lastInput,
  hintsUsed,
  hasCipherClue,
  onAttemptDecode,
  onRequestHint,
  onOpenEvidence,
  onProceedToTimeline,
}) => {
  const [inputVal, setInputVal] = useState<string>(
    solved ? DECODER_PUZZLE.expectedPlaintext : lastInput
  );
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: solved ? 'success' : null,
    message: solved
      ? 'CARRIER PARITY VERIFIED: Secondary burst decoded. File EV-06 (Bridge Voice Recorder) has been unsealed in the Archive.'
      : '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setFeedback({
        type: 'error',
        message: 'Input buffer is empty. Enter the decoded 6-word message before submitting.',
      });
      return;
    }

    const isCorrect = validateDecoderAnswer(trimmed);
    onAttemptDecode(trimmed, isCorrect);

    if (isCorrect) {
      setInputVal(DECODER_PUZZLE.expectedPlaintext);
      setFeedback({
        type: 'success',
        message:
          'DECRYPTION CONFIRMED: "THE BRIDGE IS LOCKED FROM INSIDE". Secondary voice stream (EV-06) unlocked in your Evidence Archive.',
      });
    } else {
      // Check how many words match to give constructive diagnostic feedback
      const targetWords = DECODER_PUZZLE.expectedPlaintext.split(' ');
      const userWords = trimmed
        .toUpperCase()
        .replace(/[^A-Z\s]/g, '')
        .trim()
        .split(/\s+/);
      const matchedCount = targetWords.filter((w, i) => userWords[i] === w).length;

      setFeedback({
        type: 'error',
        message: `PARITY MISMATCH (${matchedCount} of ${targetWords.length} words aligned). Shift every letter in "WKH EULGJH LV ORFNHG IURP LQVLGH" backward by 3 positions in the alphabet (W -> T, K -> H, H -> E).`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Puzzle Context */}
      <div className="bg-[#0E1311] border border-[#243029] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#1D2621]">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-[#6E9E7B]" aria-hidden="true" />
            <h2 className="text-xs font-terminal uppercase tracking-wider text-[#EAE4D7]">
              Puzzle 01 · Telemetry Scrambler Decoder
            </h2>
          </div>
          <div className="text-xs font-terminal text-[#8C968E]">
            <span>STATUS: </span>
            <span className={solved ? 'text-[#6E9E7B] font-semibold' : 'text-[#E0A96D]'}>
              {solved ? 'DECODED & VERIFIED' : 'AWAITING DECRYPTION'}
            </span>
            <span className="mx-2 text-[#3F4A43]">·</span>
            <span>ATTEMPTS: {attempts}</span>
          </div>
        </div>

        {/* Encrypted Payload Display */}
        <div className="bg-[#090C0A] border border-[#26342C] p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-terminal text-[#7D8780] mb-2">
            <span>INTERCEPTED STREAM B (FROM EV-01)</span>
            <span>PROTOCOL: {DECODER_PUZZLE.cipherType}</span>
          </div>
          <div
            className="font-terminal text-xl sm:text-2xl font-semibold tracking-widest text-[#F2ECE1] py-2 select-all"
            aria-label="Encrypted message: WKH EULGJH LV ORFNHG IURP LQVLGH"
          >
            {DECODER_PUZZLE.ciphertext}
          </div>
          <p className="text-xs text-[#9AA69E] mt-2 leading-relaxed">
            {DECODER_PUZZLE.clueSummary}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenEvidence('ev-handwritten-note')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal bg-[#141C18] hover:bg-[#1C2822] text-[#C5D1C7] border border-[#2A3830] transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
              <span>Inspect EV-02 (Dr. Vance’s Note)</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenEvidence('ev-radio-burst')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-terminal bg-[#141C18] hover:bg-[#1C2822] text-[#C5D1C7] border border-[#2A3830] transition-colors whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-[#6E9E7B]" aria-hidden="true" />
              <span>Inspect EV-01 (Radio Transmission)</span>
            </button>
            {hasCipherClue && (
              <span className="text-xs font-terminal text-[#6E9E7B]">
                Clue Verified: Cipher Offset -3 (W→T, K→H, H→E)
              </span>
            )}
          </div>
        </div>

        {/* Caesar -3 Calibration Strip (Interactive Visual Reference) */}
        <div className="mb-6 bg-[#0B0F0D] border border-[#1E2822] p-4">
          <div className="text-xs font-terminal text-[#8C968E] mb-3 flex items-center justify-between">
            <span>CAESAR SHIFT (-3) DECODING LOOKUP STRIP</span>
            <span className="text-[#6E9E7B]">TOP: ENCRYPTED LETTER → BOTTOM: DECODED LETTER</span>
          </div>
          <div className="grid grid-cols-13 sm:grid-cols-26 gap-1 text-center font-terminal text-xs">
            {ALPHABET.map((cipherChar, idx) => {
              const plainChar = ALPHABET[(idx - 3 + 26) % 26];
              const isUsedInCipher = DECODER_PUZZLE.ciphertext.includes(cipherChar);
              return (
                <div
                  key={cipherChar}
                  className={`p-1 border ${
                    isUsedInCipher
                      ? 'bg-[#141F19] border-[#354B3E]'
                      : 'bg-[#0D110F] border-[#1A211D] opacity-60'
                  }`}
                >
                  <div className="text-[#D46B5A] font-semibold">{cipherChar}</div>
                  <div className="text-[10px] text-[#5B665F]">↓</div>
                  <div className="text-[#8AB896] font-semibold">{plainChar}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decoder Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="decoder-answer-input"
              className="block text-xs font-terminal uppercase tracking-wider text-[#C2CCC4] mb-2"
            >
              Decoded Plaintext Message
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="decoder-answer-input"
                type="text"
                value={inputVal}
                disabled={solved}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Type decoded 6-word message here..."
                autoComplete="off"
                spellCheck={false}
                className="flex-1 bg-[#080A09] border border-[#2E3C34] focus:border-[#6E9E7B] px-4 py-2.5 font-terminal text-sm sm:text-base text-[#F2ECE1] uppercase tracking-wider placeholder:text-[#525C55] placeholder:normal-case placeholder:tracking-normal focus:outline-none disabled:opacity-75"
              />
              {!solved && (
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-terminal font-medium bg-[#6E9E7B] text-[#080A09] hover:bg-[#82B38F] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EAE4D7] whitespace-nowrap shrink-0"
                >
                  Verify Decryption
                </button>
              )}
            </div>
          </div>

          {/* Feedback Banner */}
          {feedback.type && (
            <div
              role="status"
              aria-live="polite"
              className={`p-4 border text-xs sm:text-sm font-terminal flex items-start gap-3 ${
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
                <p>{feedback.message}</p>
                {solved && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenEvidence('ev-recovered-audio')}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-terminal font-medium bg-[#EAE4D7] text-[#090B0A] hover:bg-white transition-colors whitespace-nowrap shrink-0"
                    >
                      <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Open Unlocked Evidence: EV-06 (Voice Recorder)</span>
                    </button>
                    <button
                      type="button"
                      onClick={onProceedToTimeline}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-terminal font-medium bg-[#1C2A22] text-[#EAE4D7] border border-[#6E9E7B] hover:bg-[#25382D] transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>Proceed to Puzzle 02: Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Staged Hint System */}
      <div className="bg-[#0D110F] border border-[#212B25] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#8C968E]" aria-hidden="true" />
            <h3 className="text-xs font-terminal uppercase tracking-wider text-[#C2CCC4]">
              Staged Cryptography Hints ({hintsUsed}/{DECODER_PUZZLE.hints.length} Revealed)
            </h3>
          </div>
          {hintsUsed < DECODER_PUZZLE.hints.length && !solved && (
            <button
              type="button"
              onClick={onRequestHint}
              className="px-3.5 py-1.5 text-xs font-terminal bg-[#161D19] hover:bg-[#202A24] text-[#EAE4D7] border border-[#2D3B33] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E9E7B] whitespace-nowrap shrink-0"
            >
              Reveal Hint {hintsUsed + 1} of {DECODER_PUZZLE.hints.length}
            </button>
          )}
        </div>

        {hintsUsed > 0 && (
          <div className="mt-4 space-y-2.5 border-t border-[#1B231E] pt-4">
            {DECODER_PUZZLE.hints.slice(0, hintsUsed).map((hintText, idx) => (
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
