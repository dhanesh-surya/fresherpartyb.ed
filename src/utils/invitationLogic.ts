import type {
  CountdownSnapshot,
  LedgerFilter,
  ThankYouRecord,
} from '../types/invitation';

export const INVITATION_IMAGE_PATH =
  '/assets/aistudio/WhatsApp_Image_2026-11-17_at_12.07.30_PM_d4401298.jpeg';

export const COLLEGE_LOGO_PATH =
  '/assets/aistudio/CHAITANYA_COLLEGE_EDUCATION__1__88285ada.png';

export const COLLEGE_BRAND = {
  eventTitle: 'Fresher Party 2026',
  organizedBy:
    'Organized by Department of Education, Chaitanya College Education, Pamgarh',
  shortName: 'Chaitanya College, Pamgarh',
} as const;

export const DEFAULT_SEED_RECORDS: ThankYouRecord[] = [
  {
    id: 'ananya verma',
    name: 'Ananya Verma',
    hits: 2,
    status: 'Thanked',
    firstLoggedInAt: '2026-11-16T09:15:00.000Z',
    lastHitAt: '2026-11-16T10:30:00.000Z',
  },
  {
    id: 'rohan deshmukh',
    name: 'Rohan Deshmukh',
    hits: 1,
    status: 'Thanked',
    firstLoggedInAt: '2026-11-16T09:45:00.000Z',
    lastHitAt: '2026-11-16T09:50:00.000Z',
  },
  {
    id: 'priya nair',
    name: 'Priya Nair',
    hits: 1,
    status: 'Thanked',
    firstLoggedInAt: '2026-11-16T08:40:00.000Z',
    lastHitAt: '2026-11-16T08:42:00.000Z',
  },
];

export const EVENT_INFO = {
  kicker: 'A Heartfelt Invitation',
  title: 'Fresher Party',
  greetingPrefix: 'Dear',
  subGreeting:
    'Get ready to embark on a new journey with new friends, new experiences and endless memories!',
  inviteLine:
    'We cordially invite you to our Fresher Party to welcome the new batch and be a part of this joyous celebration.',
  closingLine: 'Your presence will make our celebration more special. Be there!',
  dateDisplay: '19/11/26',
  dateFull: 'Thursday, 19 November 2026',
  timeDisplay: '10:00 AM to 04:00 PM',
  venueDisplay: 'Hall / Room No. 30',
  organiser: 'Organised by B.Ed. Second Year',
  dressCode: {
    girls: {
      label: 'Girls',
      attire: 'Light Pink (Formal)',
      detail: 'Formal light pink attire—saree, gown, or tailored formal wear.',
      swatches: [
        { name: 'Blush Pink', hex: '#F7C6D9' },
        { name: 'Rose Petal', hex: '#EDA6C1' },
      ],
    },
    boys: {
      label: 'Boys',
      attire: 'Black Shirt & Grey / Cream Pant',
      detail: 'Crisp formal black shirt paired with tailored grey or cream trousers.',
      swatches: [
        { name: 'Classic Black', hex: '#1F1B1D' },
        { name: 'Slate Grey', hex: '#94949B' },
        { name: 'Warm Cream', hex: '#E8DEC8' },
      ],
    },
  },
} as const;

export interface NameValidationResult {
  valid: boolean;
  name: string;
  key: string;
  error: string | null;
}

export function normalizeJuniorName(raw: string): NameValidationResult {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return {
      valid: false,
      name: '',
      key: '',
      error: 'Please enter your good name to open the invitation.',
    };
  }
  if (cleaned.length < 2) {
    return {
      valid: false,
      name: cleaned,
      key: cleaned.toLowerCase(),
      error: 'Please enter at least 2 characters for your name.',
    };
  }
  if (cleaned.length > 60) {
    return {
      valid: false,
      name: cleaned,
      key: cleaned.toLowerCase(),
      error: 'Name must be 60 characters or fewer.',
    };
  }
  return {
    valid: true,
    name: cleaned,
    key: cleaned.toLowerCase(),
    error: null,
  };
}

export function sortThankYouRecords(records: ThankYouRecord[]): ThankYouRecord[] {
  return [...records].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'Thanked' ? -1 : 1;
    }
    const aTime = a.lastHitAt ?? a.firstLoggedInAt;
    const bTime = b.lastHitAt ?? b.firstLoggedInAt;
    if (aTime !== bTime) {
      return bTime.localeCompare(aTime);
    }
    return a.name.localeCompare(b.name);
  });
}

export function registerJuniorLogin(
  records: ThankYouRecord[],
  rawName: string,
  nowIso: string
): { records: ThankYouRecord[]; currentRecord: ThankYouRecord } {
  const validation = normalizeJuniorName(rawName);
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Invalid Junior name');
  }

  const existing = records.find((r) => r.id === validation.key);
  if (existing) {
    const updatedRecord: ThankYouRecord = {
      ...existing,
      name: validation.name,
    };
    const nextRecords = records.map((r) =>
      r.id === validation.key ? updatedRecord : r
    );
    return {
      records: sortThankYouRecords(nextRecords),
      currentRecord: updatedRecord,
    };
  }

  const created: ThankYouRecord = {
    id: validation.key,
    name: validation.name,
    hits: 0,
    status: 'Pending',
    firstLoggedInAt: nowIso,
    lastHitAt: null,
  };

  return {
    records: sortThankYouRecords([created, ...records]),
    currentRecord: created,
  };
}

export function applyThankYouHit(
  records: ThankYouRecord[],
  rawName: string,
  nowIso: string
): { records: ThankYouRecord[]; currentRecord: ThankYouRecord } {
  const validation = normalizeJuniorName(rawName);
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Invalid Junior name');
  }

  const existing = records.find((r) => r.id === validation.key);
  const updatedRecord: ThankYouRecord = existing
    ? {
        ...existing,
        name: validation.name,
        hits: existing.hits + 1,
        status: 'Thanked',
        lastHitAt: nowIso,
      }
    : {
        id: validation.key,
        name: validation.name,
        hits: 1,
        status: 'Thanked',
        firstLoggedInAt: nowIso,
        lastHitAt: nowIso,
      };

  const nextRecords = existing
    ? records.map((r) => (r.id === validation.key ? updatedRecord : r))
    : [updatedRecord, ...records];

  return {
    records: sortThankYouRecords(nextRecords),
    currentRecord: updatedRecord,
  };
}

export function summarizeThankYouLedger(
  records: ThankYouRecord[],
  currentName: string | null,
  filter: LedgerFilter = 'all',
  searchQuery = ''
) {
  const sorted = sortThankYouRecords(records);
  const normalizedCurrentKey = currentName
    ? normalizeJuniorName(currentName).key
    : '';
  const currentRecord =
    sorted.find((r) => r.id === normalizedCurrentKey) ?? null;

  const totalHits = sorted.reduce((sum, item) => sum + item.hits, 0);
  const thankedCount = sorted.filter((item) => item.status === 'Thanked').length;
  const pendingCount = sorted.filter((item) => item.status === 'Pending').length;

  const query = searchQuery.trim().toLowerCase();
  const filteredRecords = sorted.filter((item) => {
    if (filter === 'thanked' && item.status !== 'Thanked') return false;
    if (filter === 'pending' && item.status !== 'Pending') return false;
    if (query && !item.name.toLowerCase().includes(query)) return false;
    return true;
  });

  return {
    records: filteredRecords,
    allRecords: sorted,
    totalHits,
    thankedCount,
    pendingCount,
    currentRecord,
  };
}

export function getEventCountdown(now: Date): CountdownSnapshot {
  const startMs = new Date(2026, 10, 19, 10, 0, 0).getTime();
  const endMs = new Date(2026, 10, 19, 16, 0, 0).getTime();
  const currentMs = now.getTime();

  if (currentMs >= startMs && currentMs <= endMs) {
    return {
      phase: 'live',
      days: 0,
      hours: 0,
      minutes: 0,
      summary: 'Celebration in progress today at Hall / Room No. 30',
    };
  }

  if (currentMs > endMs) {
    return {
      phase: 'ended',
      days: 0,
      hours: 0,
      minutes: 0,
      summary: 'Fresher Party celebrated on 19/11/26',
    };
  }

  const diffMs = startMs - currentMs;
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    phase: 'upcoming',
    days,
    hours,
    minutes,
    summary: `${days}d ${hours}h ${minutes}m remaining until doors open`,
  };
}

export function buildCalendarIcs(guestName: string): string {
  const safeGuest = guestName.replace(/[\r\n]/g, ' ').trim() || 'Junior';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BEd Second Year//Fresher Party Invitation//EN',
    'BEGIN:VEVENT',
    'UID:bed-fresher-party-2026-11-19@campus',
    'DTSTAMP:20261116T100000Z',
    'DTSTART:20261119T100000',
    'DTEND:20261119T160000',
    'SUMMARY:Fresher Party — Organised by B.Ed. Second Year',
    'LOCATION:Hall / Room No. 30',
    `DESCRIPTION:Dear ${safeGuest}\\, You are cordially invited to the Fresher Party organised by B.Ed. Second Year. Formal Dress Code: Girls - Light Pink | Boys - Black Shirt & Grey / Cream Pant.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
