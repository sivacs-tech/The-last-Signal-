import {
  ChapterData,
  EndingData,
  EndingId,
  EvidenceItem,
  FinalChoiceOption,
  GameState,
  ObjectiveItem,
  TimelineEventItem,
} from '../types/mystery';

export const STATION_METADATA = {
  stationId: 'OUTPOST VESPER-9 // WILKES SUB-GLACIAL ARRAY',
  coordinates: '71°14\'08"S 112°48\'22"E · ELEVATION -1,840M ICE SHEET',
  relayTerminal: 'ECHO-1 COASTAL RECEIVER · CASE FILE #V9-1018',
  blackoutDuration: '17 HOURS 14 MINUTES',
  carrierFrequency: '14.208 Hz SUB-AUDIBLE CARRIER // 300 BAUD BURST',
};

export const OPENING_TERMINAL_LINES = [
  'RECEIVER LOCK: ECHO-1 HIGH-LATITUDE RELAY [71.235S]',
  'SCANNING EMERGENCY BAND 406.025 MHz ... CARRIER DETECTED',
  'ORIGIN: OUTPOST VESPER-9 (DECLARED SILENT 17H 14M AGO)',
  'PACKET INTEGRITY: 68.4% // PARITY CHECK: VALID',
  'DECOMPRESSING TELEMETRY HEADER ...',
  'WARNING: MANUAL OVERRIDE FLAG PRESENT ON SOURCE TRANSPONDER',
];

export const OPENING_HEADLINE = '“IF YOU CAN READ THIS, THE STATION IS NOT EMPTY.”';

export const CHAPTERS: Record<1 | 2 | 3 | 4, ChapterData> = {
  1: {
    number: 1,
    title: 'Chapter I: The Seventeen-Hour Silence',
    subtitle: 'Initial telemetry buffer recovered from Outpost Vesper-9',
    narrative: [
      'Seventeen hours ago, Deep-Ice Acoustic Outpost Vesper-9 ceased all scheduled satellite handshakes during an unseasonable geomagnetic storm. Regional Command logged the three-person crew—Chief Acoustic Physicist Dr. Elena Vance, Systems Engineer Marcus Thorne, and Glaciologist Dr. Aris Kael—as cut off by a primary geothermal bus failure.',
      'Moments ago, your coastal relay terminal intercepted a narrow-band burst packet pushed through Vesper-9’s backup line-of-sight dish. Attached to the opening line were five fragmented station records and a scrambled secondary transmission block.',
    ],
    promptNote:
      'Examine the initial evidence in the Archive, inspect document annotations for cipher keys, and decode the scrambled transmission block.',
  },
  2: {
    number: 2,
    title: 'Chapter II: Locked From Inside',
    subtitle: 'Voice recorder packet unlocked · Chronological discrepancies detected',
    narrative: [
      'Decoding the secondary burst confirms that the Communications Bridge was never breached by ice pressure—it was mechanically bolted from the inside. A newly decrypted voice recorder transcript from the bridge reveals an escalating standoff between Dr. Vance and Engineer Thorne over an anomalous 14.2 Hz sub-glacial signal dubbed "The Choir."',
      'However, the station timestamps across the Mainframe Access Log, the Power Report, and the Cryo-Corridor surveillance frame have been partially desynchronized. Until you reconstruct the exact chronological sequence of the blackout night, you cannot unseal the station’s final black-box directive.',
    ],
    promptNote:
      'Review the newly unlocked Bridge Voice Transcript, cross-reference timestamps across the Access Log and Power Report, and reconstruct the five blackout events in the Timeline tab.',
  },
  3: {
    number: 3,
    title: 'Chapter III: The Split Dossier',
    subtitle: 'Chronology verified · Directive OMEGA-9 unsealed',
    narrative: [
      'Reconstructing the timeline exposes a chilling dual deception: Engineer Thorne intentionally tripped the geothermal breaker at 21:40 UTC—not to destroy life support, but to sever power to the borehole winch—while Dr. Vance secretly rerouted 88% of reserve power to amplify the deep-ice acoustic projector and staged a fake exterior airlock breach at 23:05 UTC.',
      'With the chronology verified, the checksum lock on Directive OMEGA-9 has opened. Inside are two mutually exclusive emergency commands waiting for your relay authorization.',
    ],
    promptNote:
      'Open the newly unlocked Final Sealed Message (EV-06) in the Archive and look closely at all remaining evidence annotations before issuing your Final Directive.',
  },
  4: {
    number: 4,
    title: 'Chapter IV: The Final Directive',
    subtitle: 'Uplink window narrowing · Relay authorization required',
    narrative: [
      'Both Dr. Vance and Engineer Thorne know you are listening at Relay Echo-1. Vance begs you to broadcast the 14.2 Hz recording and dispatch an extraction team; Thorne warns that the acoustic pattern is a neuro-resonant hazard that has already compromised the crew and demands you trigger an inductive array purge.',
      'Look closely at what you have uncovered. Every annotation you verified in the archive alters what you know about who is still inside Sector A—and what will happen when you transmit your reply.',
    ],
    promptNote:
      'Proceed to the Final Directive tab to weigh the conflicting evidence and transmit your response.',
  },
};

export const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: 'ev-radio-burst',
    code: 'EV-01',
    title: 'Partially Decoded Radio Transmission',
    shortDescription: 'Raw 300-baud telemetry packet containing the opening message and an encrypted secondary block.',
    type: 'transmission',
    timestamp: '04:14:09 UTC (Current)',
    source: 'Vesper-9 Backup Dish -> Echo-1 Receiver',
    initiallyUnlocked: true,
    unlockConditionText: 'Available in initial transmission buffer',
    summary:
      'The primary frame carries the plaintext warning "IF YOU CAN READ THIS, THE STATION IS NOT EMPTY." Immediately following the sync byte is a 28-character alphabetic payload scrambled with Vesper-9’s local telemetry shift.',
    bodyText: [
      'FRAME HEADER: V9-EMERG-BURST // SEQ 00419 // PARITY EVEN',
      'PLAINTEXT STREAM A: "IF YOU CAN READ THIS, THE STATION IS NOT EMPTY. DO NOT TRUST THE AUTOMATED BLACKOUT NOTICE."',
      'SCRAMBLED STREAM B [CIPHER ACTIVE]: "WKH EULGJH LV ORFNHG IURP LQVLGH"',
      'TRAILER NOTE: Scrambler offset matches Chief Engineer M. Thorne’s standard backup log shift. See Field Journal p. 42 for offset calibration.',
    ],
    cipherSnippet: 'WKH EULGJH LV ORFNHG IURP LQVLGH',
    annotations: [
      {
        id: 'ann-radio-shift',
        label: 'Telemetry Scrambler Header',
        excerpt: 'OFFSET_MODE: CAESAR_ALPHA // SHIFT_DELTA: +3 FORWARD',
        analysis:
          'The packet header confirms a deterministic Caesar substitution where each plaintext letter was shifted 3 positions forward in the alphabet during encoding (A -> D, B -> E, T -> W). To decode, shift each letter 3 positions backward.',
      },
      {
        id: 'ann-radio-carrier',
        label: 'Sub-Audible 14.2 Hz Bleed',
        excerpt: 'MODULATION FLOOR: 14.208 Hz HARMONIC PRESENT ON VOICE CHANNEL',
        analysis:
          'Beneath the digital burst is a faint acoustic bleed from the borehole array. Whoever transmitted this packet had the deep-ice hydrophones actively routed into the communications console.',
      },
    ],
    connectedEvidenceIds: ['ev-handwritten-note', 'ev-recovered-audio'],
  },
  {
    id: 'ev-handwritten-note',
    code: 'EV-02',
    title: 'Dr. Vance’s Margin Note (Field Journal p. 42)',
    shortDescription: 'Scanned page from Chief Acoustic Physicist Dr. Elena Vance’s notebook found in the uplink cache.',
    type: 'document',
    timestamp: 'Logged 19:10 UTC (Pre-Blackout)',
    source: 'Personal Document Scanner · Lab B',
    initiallyUnlocked: true,
    unlockConditionText: 'Available in initial transmission buffer',
    summary:
      'A high-contrast scan of Dr. Elena Vance’s grid notebook detailing the 14.2 Hz anomaly and noting Engineer Thorne’s habit of shifting backup transmission letters by three places.',
    bodyText: [
      '18 October — Depth 1,840m (Sub-Glacial Lake Vesper)',
      'At 18:15 UTC the lower hydrophone string locked onto a coherent 14.2 Hz harmonic coming from beneath the basal granite. It is not ice-shelf calving. The phase intervals repeat in prime-number clusters every 47 seconds. Aris called it "The Choir" before he went down to the Borehole Winch Room to pull the physical core transponder.',
      'Marcus is furious that I queued the raw acoustic buffer for coastal uplink. He insists the resonance is causing the crew’s insomnia and auditory echoes. Ten minutes ago I caught him re-enabling his old +3 letter-shift scrambler on the emergency terminal (where D stands for A, E stands for B, and W stands for T).',
      'If Marcus tries to cut the main bus tonight, remember: the backup decoder requires shifting every letter 3 steps back toward A.',
    ],
    annotations: [
      {
        id: 'ann-note-cipher',
        label: 'Handwritten Cipher Key in Margin',
        excerpt: 'CIPHER KEY: Encrypted [D E F ... W K H] -> Plaintext [A B C ... T H E]',
        analysis:
          'Dr. Vance explicitly wrote out the first word of the cipher shift in red ink: "WKH" decodes to "THE". Applying this -3 shift across the rest of EV-01’s scrambled string will unlock the secondary transmission.',
      },
      {
        id: 'ann-note-kael',
        label: 'Reference to Dr. Aris Kael’s Movement',
        excerpt: '"Aris went down to the Borehole Winch Room after the 18:15 UTC lock..."',
        analysis:
          'Establishes that the 14.2 Hz harmonic was detected first (18:15 UTC), prompting Dr. Kael to head to the Borehole Winch Room shortly afterward (19:50 UTC).',
      },
    ],
    connectedEvidenceIds: ['ev-radio-burst', 'ev-access-log'],
  },
  {
    id: 'ev-access-log',
    code: 'EV-03',
    title: 'Sector C Airlock & Mainframe Access Log',
    shortDescription: 'Automated door sensor and badge swipe ledger with corrupted chronological indices.',
    type: 'log',
    timestamp: '18:00 – 23:30 UTC (Blackout Night)',
    source: 'Vesper-9 Security Controller',
    initiallyUnlocked: true,
    unlockConditionText: 'Available in initial transmission buffer',
    summary:
      'The station’s hardware security ledger recorded five critical events on the night of the blackout. While the event descriptions and timestamps survived, the chronological sequence index in the timeline buffer was scrambled during the power bus switchover.',
    bodyText: [
      'SECURITY CONTROLLER DUMP // NON-VOLATILE FRAM RING BUFFER',
      'NOTE: All badge swipes are hardware-verified by RFID induction. Manual mechanical overrides log door state changes without a badge ID.',
    ],
    logRows: [
      {
        timestamp: '18:15 UTC',
        sector: 'ARRAY-DEPTH-1840M',
        actor: 'SYS-AUTO',
        event: 'Sub-glacial array locks onto 14.2 Hz prime-interval acoustic anomaly ("The Choir").',
        status: 'ALERT',
      },
      {
        timestamp: '19:50 UTC',
        sector: 'SECTOR B // WINCH ROOM',
        actor: 'BADGE #03 (DR. A. KAEL)',
        event: 'Dr. Kael badges into Borehole Winch Room to retrieve physical acoustic core transponder.',
        status: 'NOMINAL',
      },
      {
        timestamp: '21:40 UTC',
        sector: 'SECTOR D // SUBSTATION',
        actor: 'BADGE #02 (ENG. M. THORNE)',
        event: 'Manual trip of Primary Geothermal Bus breaker; station drops to 48-hour reserve battery.',
        status: 'OVERRIDE',
      },
      {
        timestamp: '22:10 UTC',
        sector: 'SECTOR A // COMMS BRIDGE',
        actor: 'BADGE #01 (DR. E. VANCE)',
        event: 'Internal deadbolt engaged on Comms Bridge bulkhead; emergency burst queue initialized.',
        status: 'OVERRIDE',
      },
      {
        timestamp: '23:05 UTC',
        sector: 'SECTOR C // AIRLOCK 02',
        actor: 'NO BADGE [MANUAL WHEEL]',
        event: 'Exterior Airlock 02 cycled open for 18 seconds. Zero EVA suit transponders departed.',
        status: 'ALERT',
      },
    ],
    annotations: [
      {
        id: 'ann-log-airlock',
        label: '23:05 UTC Unbadged Airlock Cycle',
        excerpt: 'EXTERIOR AIRLOCK 02: OPEN 18s // SUIT RFID COUNT: 0 // CABIN PRESSURE RESTORED',
        analysis:
          'Nobody walked out onto the ice at 23:05 UTC. All three polar EVA suits remained racked inside Sector C. Someone opened the outer hatch briefly and closed it again from the inside to trigger an automated "Crew Lost / Station Abandoned" alert.',
      },
      {
        id: 'ann-log-sequence',
        label: 'Chronological Ledger Verification',
        excerpt: 'EVENTS SPAN 18:15 UTC -> 19:50 UTC -> 21:40 UTC -> 22:10 UTC -> 23:05 UTC',
        analysis:
          'Cross-referencing these five hardware timestamps provides the exact chronological order required to repair the corrupted station timeline.',
      },
    ],
    connectedEvidenceIds: ['ev-photo-corridor', 'ev-power-report'],
  },
  {
    id: 'ev-photo-corridor',
    code: 'EV-04',
    title: 'Cryo-Corridor B Surveillance Frame #084',
    shortDescription: 'Archival optical/thermal composite still captured 62 seconds after Airlock 02 cycled.',
    type: 'photograph',
    timestamp: '23:06:12 UTC (Blackout Night)',
    source: 'Optical Cam 04 · Cryo-Corridor B Junction',
    initiallyUnlocked: true,
    unlockConditionText: 'Available in initial transmission buffer',
    summary:
      'A low-light surveillance frame from the junction outside Airlock 02 and the Comms Bridge bulkhead. Look closely at the three inspection markers overlaid on the frame to verify physical traces in the corridor.',
    bodyText: [
      'OPTICAL/THERMAL COMPOSITE ARCHIVE — RECONSTRUCTION STILL #084',
      'Fictional station visual evidence composite rendered from Vesper-9 Cam-04 telemetry buffer. Inspect the numbered forensic markers on the image to analyze physical clues left during the 23:05 UTC incident.',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    imageAlt:
      'Fictional station surveillance composite of a dimly lit industrial polar corridor with frost patterns and telemetry overlays',
    imageCaption:
      'FIG. 04 — CAM-04 STILL (23:06:12 UTC): Cryo-Corridor B looking toward Airlock 02 and the Sector A Bulkhead.',
    annotations: [
      {
        id: 'ann-photo-wheel',
        label: 'Pin 01 · Interior Hatch Wheel Frost',
        coordinates: { x: 24, y: 42 },
        excerpt: 'THERMAL DELTA: +31.4°C HANDPRINT ON INTERIOR MANUAL TORQUE WHEEL',
        analysis:
          'Bare-gloved thermal residue is present only on the interior manual release wheel of Airlock 02. This confirms the hatch was cracked open from inside the heated corridor to vent a plume of steam and fake an evacuation.',
      },
      {
        id: 'ann-photo-boots',
        label: 'Pin 02 · Dual Boot Prints Returning Inbound',
        coordinates: { x: 53, y: 74 },
        excerpt: 'GAIT VECTOR: TWO SETS OF TREADS LEADING FROM WINCH ROOM -> SECTOR A SHELTER',
        analysis:
          'Two distinct pairs of station boots (matching Engineer Thorne and Dr. Kael) walk away from the Borehole Winch Room and into the heated Sector A Medical Habitation Pod at 22:55 UTC—proving Kael and Thorne are both alive inside Sector A.',
      },
      {
        id: 'ann-photo-conduit',
        label: 'Pin 03 · Cleanly Sheared Intercom Trunk',
        coordinates: { x: 78, y: 34 },
        excerpt: 'FIBER CONDUIT #4: CLEAN 45° MECHANICAL SHEAR',
        analysis:
          'The local intercom wire between the Comms Bridge (Dr. Vance) and Sector A Habitation (Thorne & Kael) was deliberately snipped with insulated cable cutters, preventing the two sides of the station from speaking to each other.',
      },
    ],
    connectedEvidenceIds: ['ev-access-log', 'ev-power-report'],
  },
  {
    id: 'ev-power-report',
    code: 'EV-05',
    title: 'Geothermal & Reserve Bus Diagnostic Report',
    shortDescription: 'Load distribution table comparing station power draw before and after the 21:40 UTC breaker trip.',
    type: 'report',
    timestamp: '23:15 UTC (Automated Bus Audit)',
    source: 'Substation D Solid-State Metering Unit',
    initiallyUnlocked: true,
    unlockConditionText: 'Available in initial transmission buffer',
    summary:
      'Contrary to the automated distress beacon claiming Vesper-9 lost all heat and life support, Substation D’s metering table reveals that reserve battery capacity remains at 91%—and that someone secretly diverted massive power into the sub-glacial projector.',
    bodyText: [
      'SUBSTATION D // LOAD DISTRIBUTION AUDIT (18:00 UTC vs. 22:30 UTC)',
      'Total Reserve Battery Capacity Remaining: 44.2 Hours at current draw.',
      'CRITICAL ANOMALY: While the Borehole Winch motor was de-energized by Engineer Thorne’s breaker trip at 21:40 UTC, Dr. Vance’s bridge console immediately opened a bypass bus feeding 165 kW directly into the Deep-Ice Acoustic Projector.',
    ],
    powerRows: [
      {
        subsystem: 'Sector A Habitation & Medical Life Support',
        baselineKw: 42.0,
        postBlackoutKw: 38.5,
        status: 'STABLE (20.5°C CABIN)',
      },
      {
        subsystem: 'Sector B Borehole Winch & Core Drill',
        baselineKw: 185.0,
        postBlackoutKw: 0.0,
        status: 'ISOLATED BY BREAKER TRIP',
      },
      {
        subsystem: 'Sector A Comms Bridge & Echo-1 Dish',
        baselineKw: 18.0,
        postBlackoutKw: 29.5,
        status: 'ACTIVE BURST UPLINK',
      },
      {
        subsystem: 'Deep-Ice Acoustic Projector Array (14.2 Hz)',
        baselineKw: 12.0,
        postBlackoutKw: 165.0,
        status: 'OVERDRIVE (+1,275% LOAD)',
      },
    ],
    annotations: [
      {
        id: 'ann-power-lifesupport',
        label: 'Sector A Life Support Still Nominal',
        excerpt: 'HABITATION POD TEMP: 20.5°C // O2 SCRUBBERS: 98% EFFICIENCY',
        analysis:
          'Nobody on Vesper-9 is freezing to death. Both the Comms Bridge and the Sector A Medical Habitation Pod have full heating and breathable air for nearly two more days.',
      },
      {
        id: 'ann-power-projector',
        label: '165 kW Acoustic Projector Overdrive',
        excerpt: 'DEEP-ICE PROJECTOR: TRANSMITTING 14.2 Hz BACK INTO SUB-GLACIAL CAVITY',
        analysis:
          'Dr. Vance isn’t merely listening to "The Choir"—from inside the locked bridge, she is using the station’s acoustic projector to broadcast a 165-kilowatt answer back down into the sub-glacial lake.',
      },
    ],
    connectedEvidenceIds: ['ev-access-log', 'ev-sealed-message'],
  },
  {
    id: 'ev-recovered-audio',
    code: 'EV-06',
    title: 'Decoded Burst Transcript: Bridge Voice Recorder',
    shortDescription: 'Cockpit-grade voice log recovered from the secondary stream after solving the Caesar shift.',
    type: 'audio-transcript',
    timestamp: '21:35 – 22:12 UTC (Blackout Night)',
    source: 'Comms Bridge Overhead Condenser Mic',
    initiallyUnlocked: false,
    unlockConditionText: 'Locked — Decode the scrambled transmission in the Decoder tab to unseal.',
    summary:
      'Unlocked by decoding `"THE BRIDGE IS LOCKED FROM INSIDE"`. This audio transcript captures the confrontation between Dr. Vance and Engineer Thorne minutes before Vance bolted the bridge door.',
    bodyText: [
      'DECRYPTED VOICE STREAM // BRIDGE RECORDER LOOP #19',
      'Audio quality: Clear indoor condenser capture with a persistent 14.2 Hz sub-bass hum vibrating the bulkhead steel.',
    ],
    transcriptLines: [
      {
        timecode: '21:36:14',
        speaker: 'ENG. THORNE',
        tone: 'strained, urgent',
        text: 'Elena, look at Aris! Put the headphones down and look at him! He was standing in the winch room in his socks with the inner hatch unlatched, humming a 14-hertz interval in his sleep.',
      },
      {
        timecode: '21:36:42',
        speaker: 'DR. VANCE',
        tone: 'calm, fixated',
        text: 'His auditory cortex is just entraining to the carrier wave, Marcus. It’s a structured mathematical prime sequence from beneath two kilometers of Pleistocene ice. If we drop the array now, we lose the phase lock.',
      },
      {
        timecode: '21:39:55',
        speaker: 'ENG. THORNE',
        tone: 'resolute',
        text: 'It’s not a discovery, it’s a feedback loop—and it’s rewriting how you both think. I’m pulling the main geothermal breaker at Substation D. We’re sitting on reserve heat until the sun comes up.',
      },
      {
        timecode: '22:09:48',
        speaker: 'DR. VANCE',
        tone: 'whispering near console mic',
        text: '[Sound of heavy bulkhead bolts sliding shut] Marcus took Aris to the medical pod and cut the corridor intercom. They think the array is dead. I’ve routed the reserve bus into the projector. Now I just need Echo-1 to open the coastal relay.',
      },
    ],
    annotations: [
      {
        id: 'ann-audio-entrainment',
        label: 'Acoustic Neural Entrainment Symptoms',
        excerpt: '"He was standing in the winch room... humming a 14-hertz interval in his sleep."',
        analysis:
          'Confirms Engineer Thorne’s motive: the 14.2 Hz sub-glacial signal was inducing somnambulism and compulsive fixation in both scientists.',
      },
      {
        id: 'ann-audio-timestamp',
        label: 'Bulkhead Lock Timestamp (22:10 UTC)',
        excerpt: '22:09:48 UTC — Bulkhead deadbolts engaged immediately after the 21:40 UTC breaker trip.',
        analysis:
          'Verifies that Dr. Vance locked the bridge at 22:10 UTC in direct response to Thorne tripping the geothermal breaker at 21:40 UTC.',
      },
    ],
    connectedEvidenceIds: ['ev-radio-burst', 'ev-sealed-message'],
  },
  {
    id: 'ev-sealed-message',
    code: 'EV-07',
    title: 'Directive OMEGA-9 // Final Sealed Dossier',
    shortDescription: 'Dual-channel emergency command packet containing conflicting final appeals from Vance and Thorne.',
    type: 'sealed-message',
    timestamp: '04:12:00 UTC (Queued for Echo-1)',
    source: 'Dual-Key Station Command Buffer',
    initiallyUnlocked: false,
    unlockConditionText: 'Locked — Reconstruct the station timeline in the Timeline tab to unseal.',
    summary:
      'Unsealed after timeline verification. Both Dr. Vance (from the Comms Bridge) and Engineer Thorne (via a hardwired Substation D telemetry injector) have appended command payloads to the outgoing buffer. Only one protocol can be executed by Relay Echo-1.',
    bodyText: [
      '=== CHANNEL ALPHA: DR. ELENA VANCE (COMMS BRIDGE) ===',
      '"Echo-1 Operator: Do not listen to Marcus Thorne’s override packet. Panic and cabin fever drove him to sabotage our primary bus and lock Dr. Kael in the medical bay. The signal beneath Lake Vesper is responding to our 165 kW acoustic ping with complex geometric harmonics. If you authorize UPLINK RELAY & EXTRACTION, our full dataset transmits to the global scientific network and the coast guard icebreaker retrieves us before Marcus can destroy the core samples."',
      '=== CHANNEL BETA: ENG. MARCUS THORNE (SUBSTATION D INJECTOR) ===',
      '"Echo-1 Operator: I wired this message directly into the dish feed line from Substation D. Elena is not lying to you out of malice—she genuinely no longer hears what she is doing. The 14.2 Hz resonance from the borehole acts like an acoustic prion on human temporal lobes. Aris is finally stabilizing in the shielded med-bay now that I got him away from the winch room, but Elena has cranked the deep-ice projector to 165 kW. If she relays that waveform over the coastal network—or if whatever is down in that lake finishes syncing with the projector—we won’t contain it. Transmit the INDUCTIVE PURGE CODE now to burn out Vesper-9’s array transceivers."',
    ],
    annotations: [
      {
        id: 'ann-sealed-contradiction',
        label: 'Forensic Cross-Check of Both Claims',
        excerpt: 'VANCE CLAIM: "Exterior breach / freezing" [FALSE] vs. THORNE CLAIM: "Projector at 165 kW" [TRUE]',
        analysis:
          'Every physical log in your archive backs up Thorne’s technical telemetry while exposing Vance’s staged 23:05 UTC airlock breach—yet executing Thorne’s full inductive purge will also fry the Comms Bridge consoles while Vance is bolted inside.',
      },
      {
        id: 'ann-sealed-thirdway',
        label: 'Substation D Narrow-Band Cutoff Option',
        excerpt: 'RELAY DIAGNOSTIC: ECHO-1 CAN QUARANTINE CARRIER WITHOUT FIRING HIGH-VOLTAGE SURGE',
        analysis:
          'Because you inspected the Power Report and Corridor Surveillance annotations, you know a third option exists: sever the 165 kW acoustic projector bus remotely while keeping the acoustic data quarantined inside a local offline buffer and dispatching a medically shielded recovery team.',
      },
    ],
    connectedEvidenceIds: ['ev-power-report', 'ev-recovered-audio', 'ev-photo-corridor'],
  },
];

export const DECODER_PUZZLE = {
  ciphertext: 'WKH EULGJH LV ORFNHG IURP LQVLGH',
  expectedPlaintext: 'THE BRIDGE IS LOCKED FROM INSIDE',
  cipherType: 'Caesar Alphabet Shift (Offset -3 to Decode)',
  promptText:
    'Enter the decoded 28-letter message from Stream B of EV-01 (Partially Decoded Radio Transmission). Punctuation and letter case are ignored.',
  clueSummary:
    'Check Dr. Vance’s Margin Note (EV-02): Engineer Thorne configured the backup telemetry scrambler with a +3 Caesar shift where D = A, E = B, and W = T.',
  hints: [
    'Hint 1 (Reasoning): Each letter in the scrambled message was shifted 3 positions forward in the alphabet (A became D, B became E). To decode it, shift every letter 3 positions backward in the alphabet.',
    'Hint 2 (Word Breakdown): Apply the -3 shift to the first two words: "WKH" -> T-H-E, and "EULGJH" -> B-R-I-D-G-E.',
    'Hint 3 (Near-Complete Solution): The first five words decode to "THE BRIDGE IS LOCKED FROM...". Decode the final word "LQVLGH" by shifting each letter back 3 places.',
  ],
};

export function validateDecoderAnswer(rawInput: string): boolean {
  const normalized = rawInput
    .toUpperCase()
    .replace(/[^A-Z\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
  return normalized === DECODER_PUZZLE.expectedPlaintext;
}

export const TIMELINE_EVENTS: TimelineEventItem[] = [
  {
    id: 'tl-choir-detected',
    correctIndex: 0,
    code: 'EVENT ALPHA',
    title: 'Sub-glacial array locks onto the 14.2 Hz harmonic ("The Choir")',
    description:
      'Lower borehole hydrophones at 1,840m depth register a repeating prime-number acoustic pattern beneath the basal granite.',
    sourceClue: 'Referenced in Dr. Vance’s Margin Note (EV-02) and Access Log (EV-03) as the catalyst that began the evening.',
    revealedTimeAfterSolve: '18:15 UTC',
  },
  {
    id: 'tl-kael-winch',
    correctIndex: 1,
    code: 'EVENT BETA',
    title: 'Dr. Aris Kael enters the Borehole Winch Room for the core transponder',
    description:
      'Following the initial acoustic lock, Glaciologist Dr. Kael badges into Sector B to retrieve the physical core transponder—where he is later found sleepwalking.',
    sourceClue: 'Vance’s Margin Note states Kael went to the winch room after the 18:15 lock; Access Log records Badge #03 at 19:50 UTC.',
    revealedTimeAfterSolve: '19:50 UTC',
  },
  {
    id: 'tl-thorne-breaker',
    correctIndex: 2,
    code: 'EVENT GAMMA',
    title: 'Engineer Thorne manually trips the Primary Geothermal Bus breaker',
    description:
      'After finding Kael entrained by the sound in the winch room, Thorne pulls the main breaker in Substation D to cut power to the borehole winch.',
    sourceClue: 'Bridge Voice Recorder (EV-06) captures Thorne announcing the breaker trip at 21:39 UTC; Access Log records Substation D override at 21:40 UTC.',
    revealedTimeAfterSolve: '21:40 UTC',
  },
  {
    id: 'tl-vance-bridge',
    correctIndex: 3,
    code: 'EVENT DELTA',
    title: 'Dr. Vance bolts the Comms Bridge from inside and diverts 165 kW to the projector',
    description:
      'In response to Thorne cutting the main bus, Vance seals the bridge bulkhead from within and routes reserve battery power into the deep-ice acoustic projector.',
    sourceClue: 'Voice Recorder logs bulkhead bolts sliding shut at 22:09:48 UTC; Access Log confirms Bridge deadbolt at 22:10 UTC.',
    revealedTimeAfterSolve: '22:10 UTC',
  },
  {
    id: 'tl-airlock-spoof',
    correctIndex: 4,
    code: 'EVENT EPSILON',
    title: 'Exterior Airlock 02 cycles open on manual override with zero suit departures',
    description:
      'Someone turns the interior manual wheel of Airlock 02 for 18 seconds to vent warm air and trigger an automated evacuation distress beacon.',
    sourceClue: 'Access Log records the unbadged airlock cycle at 23:05 UTC, followed 62 seconds later by Surveillance Frame #084 (23:06:12 UTC).',
    revealedTimeAfterSolve: '23:05 UTC',
  },
];

// Initial scrambled order presented to the player (indices: 3, 0, 4, 1, 2)
export const INITIAL_SCRAMBLED_TIMELINE_IDS: string[] = [
  'tl-vance-bridge',
  'tl-choir-detected',
  'tl-airlock-spoof',
  'tl-kael-winch',
  'tl-thorne-breaker',
];

export const TIMELINE_HINTS: string[] = [
  'Hint 1 (First Event): Everything began with the discovery of the sub-glacial signal. Place "Sub-glacial array locks onto the 14.2 Hz harmonic" (18:15 UTC) at Position 1.',
  'Hint 2 (Middle Sequence): After the signal was detected, Dr. Kael went to the Winch Room (19:50 UTC, Position 2). Finding Kael affected there caused Engineer Thorne to trip the Geothermal Breaker (21:40 UTC, Position 3).',
  'Hint 3 (Final Events): Thorne’s breaker trip prompted Dr. Vance to bolt the Comms Bridge from inside (22:10 UTC, Position 4), and the staged Exterior Airlock cycle happened last (23:05 UTC, Position 5).',
];

export function validateTimelineOrder(orderIds: string[]): boolean {
  const expected = [...TIMELINE_EVENTS]
    .sort((a, b) => a.correctIndex - b.correctIndex)
    .map((item) => item.id);
  if (orderIds.length !== expected.length) return false;
  return orderIds.every((id, index) => id === expected[index]);
}

export const FINAL_CHOICES: FinalChoiceOption[] = [
  {
    id: 'choice-rescue',
    title: 'Trust Dr. Vance’s Transmission · Authorize Broadcast & Extraction',
    subtitle: 'Open the Echo-1 coastal relay to preserve the 14.2 Hz dataset and dispatch immediate polar extraction.',
    alignedWith: 'Dr. Elena Vance (Chief Acoustic Physicist)',
    directiveCode: 'DIRECTIVE ALPHA // RELAY & EXTRACT',
    summary:
      'Accept Dr. Vance’s appeal that the sub-glacial signal is a historic scientific phenomenon and that Engineer Thorne’s sabotage endangers the crew. Open the high-gain coastal relay and deploy the icebreaker recovery team immediately.',
    supportingEvidenceIds: ['ev-radio-burst', 'ev-handwritten-note'],
    consequencePreview:
      'Prioritizes crew extraction and scientific preservation, but broadcasts the unfiltered 14.2 Hz harmonic across the coastal relay network.',
    targetEndingId: 'rescue',
  },
  {
    id: 'choice-containment',
    title: 'Trust Engineer Thorne’s Override · Execute Acoustic Purge & Quarantine',
    subtitle: 'Transmit the high-voltage inductive kill-code to burn out Vesper-9’s array and enforce cognitive containment.',
    alignedWith: 'Marcus Thorne (Chief Systems Engineer)',
    directiveCode: 'DIRECTIVE BETA // PROTOCOL CINDER',
    summary:
      'Heed Marcus Thorne’s warning and the physical evidence of neural entrainment. Fire a remote inductive surge through Substation D to permanently fuse the deep-ice acoustic projector and quarantine Outpost Vesper-9 until spring.',
    supportingEvidenceIds: ['ev-power-report', 'ev-recovered-audio', 'ev-photo-corridor'],
    consequencePreview:
      'Immediately halts the 165 kW deep-ice transmission and protects the coastal network, but destroys all research data and risks injuring Dr. Vance inside the bridge.',
    targetEndingId: 'containment',
  },
  {
    id: 'choice-unresolved',
    title: 'Reject Both Commands · Isolate Carrier & Lock Substation Bus',
    subtitle: 'Refuse to broadcast the signal or fire a lethal surge; drop the projector bus remotely and hold the truth in dark storage.',
    alignedWith: 'Independent Archival Verdict (Relay Operator Echo-1)',
    directiveCode: 'DIRECTIVE OMEGA // DARK BUFFER ISOLATION',
    summary:
      'Recognize that both Vance and Thorne manipulated the station records. Use Substation D’s metering telemetry to trip only the 165 kW projector bypass without frying the bridge, locking the 14.2 Hz packet inside an air-gapped drive at Echo-1.',
    supportingEvidenceIds: ['ev-access-log', 'ev-photo-corridor', 'ev-power-report', 'ev-sealed-message'],
    consequencePreview:
      'Severs the dangerous feedback loop without destroying the Comms Bridge, leaving the mystery of Lake Vesper sealed in your local terminal.',
    targetEndingId: 'unresolved',
  },
];

export const ENDINGS: Record<EndingId, EndingData> = {
  rescue: {
    id: 'rescue',
    code: 'ENDING 01 // OPERATION WHITEOUT',
    title: 'The Rescue Ending: A Choir on the Open Wire',
    subtitle: 'You trusted Dr. Elena Vance, opened the coastal relay, and dispatched the extraction team.',
    classification: 'OUTCOME: EXTRACTION COMPLETED · SIGNAL BROADCAST GLOBALLY',
    leadQuote: '“We saved all three of them from the ice. None of them have stopped humming since the helicopter lifted off.”',
    narrativeParagraphs: [
      'At 04:19 UTC, your terminal at Relay Echo-1 opens the wideband satellite transponder. For eleven uninterrupted minutes, Vesper-9’s 165-kilowatt acoustic exchange with the cavity beneath Lake Vesper streams through your coastal dish and mirrors automatically to four university archives in Hobart, Christchurch, and Zurich.',
      'Six hours later, a heavy ski-equipped recovery transport touches down beside Sector C. Because your telemetry uplink remained live, the extraction team breaches the station without casualties. They find Dr. Elena Vance slumped over the Comms Bridge console in a state of exhausted euphoria, and Engineer Marcus Thorne guarding a recovering Dr. Aris Kael inside the Sector A medical bay.',
    ],
    deepClueParagraph:
      'CLOSER LOOK VERDICT (ALL FORENSIC CLUES VERIFIED): Because you inspected the Cryo-Corridor surveillance pins and the Substation D load audit prior to dispatching the team, you warned the recovery medics about the severed intercom conduit and the 14.2 Hz auditory entrainment. The boarding party wore active noise-canceling helmets and immediately shut down the 165 kW projector bus upon arrival—saving the rescue crew from exposure, even though the signal had already escaped onto the global academic network.',
    shallowClueParagraph:
      'UNEXAMINED ARCHIVE NOTE: Because several forensic annotations remained uninspected in your archive, the extraction team entered Sector A without acoustic dampening gear. By the time the transport returned to the coast, two of the recovery pilots reported the same rhythmic 47-second prime-number ringing in their ears.',
    finalStatusReport: {
      stationStatus: 'Evacuated · Deep-Ice Array left in passive standby',
      crewFate: 'Vance, Thorne, and Kael recovered alive; under neurological observation',
      signalDisposition: 'Mirrored to 4 international acoustic archives prior to cutoff',
      archivalVerdict: 'Compassion preserved the crew, but opened the door to what lay beneath the ice.',
    },
  },
  containment: {
    id: 'containment',
    code: 'ENDING 02 // PROTOCOL CINDER',
    title: 'The Containment Ending: Silence Under Two Kilometers of Ice',
    subtitle: 'You trusted Engineer Marcus Thorne and transmitted the inductive purge code.',
    classification: 'OUTCOME: ARRAY DESTROYED · COGNITIVE HAZARD CONTAINED',
    leadQuote: '“The carrier wave dropped to zero at 04:20:03 UTC. Whatever was answering the projector is back in the dark.”',
    narrativeParagraphs: [
      'You key in Engineer Thorne’s override authorization and fire the inductive purge sequence directly into Substation D. Across the freezing expanse of Wilkes Land, solid-state relays slam shut in reverse polarity. A 400-amp surge races down the two-kilometer borehole cable, fusing the hydrophone preamplifiers and vaporizing the coils of the 165 kW acoustic projector.',
      'Inside the locked Comms Bridge, the console banks arc and go dark in a shower of acrid ozone. When the heavy steel deadbolt finally releases on failsafe fifteen minutes later, Marcus Thorne pulls a coughing, dazed Dr. Elena Vance out of the smoke-filled bridge into the heated Sector A habitation pod. The 14.2 Hz vibration in the station’s steel ribs is gone.',
    ],
    deepClueParagraph:
      'CLOSER LOOK VERDICT (ALL FORENSIC CLUES VERIFIED): Your thorough inspection of the Power Report and Surveillance Frame #084 proved decisive. Knowing that Sector A’s life support was still running at 20.5°C with 44 hours of reserve battery, you calibrated the surge to spare the habitation heating bus while targeting only the acoustic array and bridge transmitter. All three researchers survived the winter quarantine in complete radio silence.',
    shallowClueParagraph:
      'UNEXAMINED ARCHIVE NOTE: Without a full audit of the Substation D load table, the uncalibrated inductive purge took out half of Sector A’s auxiliary heating relays along with the comms dish. The crew survived on emergency chemical heaters until the relief tractor train arrived nine days later, with zero physical proof of what they had heard.',
    finalStatusReport: {
      stationStatus: 'Quarantined · Borehole acoustic array permanently fused',
      crewFate: 'All three researchers survived on reserve habitation power; Vance suffered minor smoke inhalation',
      signalDisposition: 'Erased from Vesper-9 memory banks; zero packets leaked beyond Echo-1',
      archivalVerdict: 'You prioritized containment over curiosity, burying both the hazard and the discovery.',
    },
  },
  unresolved: {
    id: 'unresolved',
    code: 'ENDING 03 // THE GHOST CARRIER',
    title: 'The Unresolved Ending: The Air-Gapped Truth',
    subtitle: 'You refused both partisans, severed the projector bypass, and locked the recording in local cold storage.',
    classification: 'OUTCOME: DUAL DECEPTION EXPOSED · RECORD SEALED AT ECHO-1',
    leadQuote: '“Neither the scientist who faked a breach nor the engineer who pulled the breaker gets to write the official history.”',
    narrativeParagraphs: [
      'Looking closely at the evidence revealed what neither message admitted openly: Dr. Vance staged the 23:05 UTC airlock breach and secretly pumped 165 kilowatts into the sub-glacial lake, while Engineer Thorne crippled the station’s main bus and falsified a total blackout to force a purge. Refusing to act as a pawn for either faction, you send a targeted bus command to Substation D that drops the projector relay to 0 kW without firing Thorne’s destructive surge.',
      'You then sever the external satellite uplink at Relay Echo-1, trapping the sole copy of the 14.2 Hz recording inside an air-gapped magnetic cartridge on your desk. On your oscilloscope, Vesper-9’s carrier wave flatlines—and then, for three final seconds before the borehole hydrophones power down, a 14.2 Hz pulse echoes back up through the ice on its own, unprompted by any human transmitter.',
    ],
    deepClueParagraph:
      'CLOSER LOOK VERDICT (ALL FORENSIC CLUES VERIFIED): Having uncovered every single forensic annotation across all seven evidence files, your air-gapped dossier at Echo-1 is airtight. When the polar relief ship reaches Vesper-9 forty-eight hours later, both Vance and Thorne are relieved of command, and your complete reconstruction becomes the sole classified record of Incident V9-1018.',
    shallowClueParagraph:
      'UNEXAMINED ARCHIVE NOTE: Although you avoided both extremes, several unexamined clues remain hidden inside the evidence files. Replay or return to the archive and inspect every document annotation and photo pin to uncover the full forensic picture.',
    finalStatusReport: {
      stationStatus: 'Stabilized remotely · Acoustic projector de-energized without surge damage',
      crewFate: 'Vance, Thorne, and Kael retrieved intact 48 hours later under administrative inquiry',
      signalDisposition: 'Single encrypted copy held offline at Relay Echo-1; origin remains unexplained',
      archivalVerdict: 'By looking closer than either narrator intended, you stopped the crisis—but kept the mystery alive.',
    },
  },
};

export function createInitialGameState(): GameState {
  const initialDiscovered = EVIDENCE_ITEMS.filter((item) => item.initiallyUnlocked).map(
    (item) => item.id
  );
  return {
    version: 1,
    phase: 'opening',
    openingRevealed: false,
    chapter: 1,
    discoveredEvidenceIds: initialDiscovered,
    investigatedEvidenceIds: [],
    discoveredAnnotationIds: [],
    selectedEvidenceId: null,
    activeTab: 'archive',
    evidenceFilter: 'all',
    puzzles: {
      decoder: {
        solved: false,
        attempts: 0,
        lastInput: '',
        hintsUsed: 0,
      },
      timeline: {
        solved: false,
        attempts: 0,
        currentOrder: [...INITIAL_SCRAMBLED_TIMELINE_IDS],
        hintsUsed: 0,
      },
      finalDecision: {
        selectedChoiceId: null,
        endingId: null,
      },
    },
    soundEnabled: false,
    lastUpdated: new Date().toISOString(),
  };
}

export function deriveObjectives(state: GameState): ObjectiveItem[] {
  const initialUnlockedCount = 5;
  const initialInvestigatedCount = state.investigatedEvidenceIds.filter((id) =>
    ['ev-radio-burst', 'ev-handwritten-note', 'ev-access-log', 'ev-photo-corridor', 'ev-power-report'].includes(id)
  ).length;

  const hasCipherClue =
    state.discoveredAnnotationIds.includes('ann-note-cipher') ||
    state.discoveredAnnotationIds.includes('ann-radio-shift') ||
    state.investigatedEvidenceIds.includes('ev-handwritten-note');

  const allEvidenceInvestigated =
    state.investigatedEvidenceIds.length >= state.discoveredEvidenceIds.length &&
    state.discoveredEvidenceIds.length === EVIDENCE_ITEMS.length;

  return [
    {
      id: 'obj-inspect-initial',
      label: `Examine initial station files (${Math.min(initialInvestigatedCount, 3)}/3 minimum)`,
      detail: 'Open evidence files in the Archive and inspect embedded forensic annotations.',
      completed: initialInvestigatedCount >= 3 || state.puzzles.decoder.solved,
      active: !state.puzzles.decoder.solved && initialInvestigatedCount < 3,
      targetTab: 'archive',
    },
    {
      id: 'obj-find-cipher-key',
      label: 'Locate the telemetry scrambler key in Dr. Vance’s Note',
      detail: 'Inspect EV-02 (Dr. Vance’s Margin Note) to find the Caesar shift offset.',
      completed: hasCipherClue || state.puzzles.decoder.solved,
      active: !hasCipherClue && !state.puzzles.decoder.solved,
      targetTab: 'archive',
      targetEvidenceId: 'ev-handwritten-note',
    },
    {
      id: 'obj-solve-decoder',
      label: 'Decode the scrambled transmission block (Puzzle 1)',
      detail: 'Use the Transmission Decoder to translate "WKH EULGJH LV ORFNHG IURP LQVLGH".',
      completed: state.puzzles.decoder.solved,
      active: !state.puzzles.decoder.solved,
      targetTab: 'decoder',
    },
    {
      id: 'obj-inspect-audio',
      label: 'Review the unlocked Bridge Voice Recorder (EV-06)',
      detail: 'Examine the confrontation transcript unlocked by the decoder.',
      completed: state.investigatedEvidenceIds.includes('ev-recovered-audio'),
      active:
        state.puzzles.decoder.solved &&
        !state.investigatedEvidenceIds.includes('ev-recovered-audio'),
      targetTab: 'archive',
      targetEvidenceId: 'ev-recovered-audio',
    },
    {
      id: 'obj-solve-timeline',
      label: 'Reconstruct the 5 blackout night events (Puzzle 2)',
      detail: 'Order the station events chronologically in the Timeline tab to unseal Directive OMEGA-9.',
      completed: state.puzzles.timeline.solved,
      active: state.puzzles.decoder.solved && !state.puzzles.timeline.solved,
      targetTab: 'timeline',
    },
    {
      id: 'obj-inspect-sealed',
      label: 'Examine Directive OMEGA-9 & verify all evidence (EV-07)',
      detail: 'Read the conflicting appeals in EV-07 and mark remaining evidence as investigated.',
      completed:
        state.investigatedEvidenceIds.includes('ev-sealed-message') && allEvidenceInvestigated,
      active:
        state.puzzles.timeline.solved &&
        (!state.investigatedEvidenceIds.includes('ev-sealed-message') || !allEvidenceInvestigated),
      targetTab: 'archive',
      targetEvidenceId: 'ev-sealed-message',
    },
    {
      id: 'obj-final-decision',
      label: 'Transmit your Final Directive from Relay Echo-1 (Puzzle 3)',
      detail: 'Choose which interpretation of the mystery to trust and determine Vesper-9’s fate.',
      completed: state.puzzles.finalDecision.endingId !== null,
      active:
        state.puzzles.decoder.solved &&
        state.puzzles.timeline.solved &&
        state.puzzles.finalDecision.endingId === null,
      targetTab: 'decision',
    },
  ];
}
