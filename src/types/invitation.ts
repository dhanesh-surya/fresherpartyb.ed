export type ThankYouStatus = 'Thanked' | 'Pending';

export interface ThankYouRecord {
  id: string;
  name: string;
  hits: number;
  status: ThankYouStatus;
  firstLoggedInAt: string;
  lastHitAt: string | null;
}

export interface ThankYouLedgerResponse {
  records: ThankYouRecord[];
  totalHits: number;
  thankedCount: number;
  pendingCount: number;
  currentRecord: ThankYouRecord | null;
}

export type DressCodeGroup = 'girls' | 'boys';

export type LedgerFilter = 'all' | 'thanked' | 'pending';

export interface CountdownSnapshot {
  phase: 'upcoming' | 'live' | 'ended';
  days: number;
  hours: number;
  minutes: number;
  summary: string;
}

export interface DressCodeSwatch {
  name: string;
  hex: string;
}

export interface DressCodeProfile {
  label: string;
  attire: string;
  detail: string;
  swatches: DressCodeSwatch[];
}

export interface ProgramItem {
  id: string;
  time: string;
  title: string;
  detail: string;
}

export interface EditableEventConfig {
  eventTitle: string;
  organizedBy: string;
  kicker: string;
  title: string;
  subGreeting: string;
  inviteLine: string;
  closingLine: string;
  dateDisplay: string;
  dateFull: string;
  timeDisplay: string;
  venueDisplay: string;
  organiser: string;
  dressCode: {
    girls: DressCodeProfile;
    boys: DressCodeProfile;
  };
  program: ProgramItem[];
}
