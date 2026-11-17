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
