import type {
  EditableEventConfig,
  ThankYouLedgerResponse,
  ThankYouRecord,
  ThankYouStatus,
} from '../types/invitation';
import {
  adminDeleteJunior,
  adminUpsertJunior,
  applyThankYouHit,
  DEFAULT_EVENT_CONFIG,
  DEFAULT_SEED_RECORDS,
  registerJuniorLogin,
  sanitizeEventConfig,
  summarizeThankYouLedger,
} from './invitationLogic';

const RECORDS_STORAGE_KEY = 'bed_fresher_thank_you_records_v1';
const CONFIG_STORAGE_KEY = 'bed_fresher_event_config_v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type FetchLike = (
  input: string,
  init?: RequestInit
) => Promise<Response>;

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readLocalRecords(storage: StorageLike | null): ThankYouRecord[] {
  if (!storage) {
    return [...DEFAULT_SEED_RECORDS];
  }
  try {
    const raw = storage.getItem(RECORDS_STORAGE_KEY);
    if (!raw) {
      storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(DEFAULT_SEED_RECORDS));
      return [...DEFAULT_SEED_RECORDS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ThankYouRecord[];
    }
  } catch {
    // Fall back to default seed records if storage is corrupted or blocked
  }
  return [...DEFAULT_SEED_RECORDS];
}

export function writeLocalRecords(
  storage: StorageLike | null,
  records: ThankYouRecord[]
): void {
  if (!storage) return;
  try {
    storage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function readLocalConfig(
  storage: StorageLike | null
): EditableEventConfig {
  if (!storage) return sanitizeEventConfig(DEFAULT_EVENT_CONFIG);
  try {
    const raw = storage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      storage.setItem(
        CONFIG_STORAGE_KEY,
        JSON.stringify(DEFAULT_EVENT_CONFIG)
      );
      return sanitizeEventConfig(DEFAULT_EVENT_CONFIG);
    }
    return sanitizeEventConfig(JSON.parse(raw) as Partial<EditableEventConfig>);
  } catch {
    return sanitizeEventConfig(DEFAULT_EVENT_CONFIG);
  }
}

export function writeLocalConfig(
  storage: StorageLike | null,
  config: EditableEventConfig
): void {
  if (!storage) return;
  try {
    storage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export async function parseJsonSafely<T>(response: Response): Promise<T | null> {
  try {
    const text = await response.text();
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('<')) {
      return null;
    }
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
}

function isValidLedgerPayload(
  payload: unknown
): payload is ThankYouLedgerResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    Array.isArray((payload as ThankYouLedgerResponse).records)
  );
}

function isValidConfigPayload(
  payload: unknown
): payload is EditableEventConfig {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof (payload as EditableEventConfig).eventTitle === 'string' &&
    typeof (payload as EditableEventConfig).venueDisplay === 'string'
  );
}

function buildLocalResponse(
  records: ThankYouRecord[],
  activeName: string | null,
  currentRecordOverride?: ThankYouRecord | null
): ThankYouLedgerResponse {
  const summary = summarizeThankYouLedger(records, activeName, 'all', '');
  return {
    records: summary.allRecords,
    totalHits: summary.totalHits,
    thankedCount: summary.thankedCount,
    pendingCount: summary.pendingCount,
    currentRecord: currentRecordOverride ?? summary.currentRecord,
  };
}

function isNetworkFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return true;
  const msg = err.message.toLowerCase();
  return msg === 'failed to fetch' || msg.includes('network');
}

export async function fetchLedger(
  activeName: string | null,
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<ThankYouLedgerResponse> {
  const query = activeName ? `?name=${encodeURIComponent(activeName)}` : '';
  try {
    const response = await fetcher(`/api/thank-you${query}`);
    const payload = await parseJsonSafely<ThankYouLedgerResponse>(response);
    if (response.ok && isValidLedgerPayload(payload)) {
      writeLocalRecords(storage, payload.records);
      return payload;
    }
  } catch {
    // Network unavailable or static host (e.g. Netlify) -> use local store
  }

  const localRecords = readLocalRecords(storage);
  return buildLocalResponse(localRecords, activeName);
}

export async function loginJunior(
  name: string,
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<ThankYouLedgerResponse> {
  try {
    const response = await fetcher('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const payload = await parseJsonSafely<
      Partial<ThankYouLedgerResponse> & { error?: string }
    >(response);

    if (payload) {
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to open invitation.');
      }
      if (isValidLedgerPayload(payload)) {
        writeLocalRecords(storage, payload.records);
        return payload;
      }
    }
  } catch (err) {
    if (!isNetworkFailure(err)) {
      throw err;
    }
  }

  const localRecords = readLocalRecords(storage);
  const { records: updated, currentRecord } = registerJuniorLogin(
    localRecords,
    name,
    new Date().toISOString()
  );
  writeLocalRecords(storage, updated);
  return buildLocalResponse(updated, currentRecord.name, currentRecord);
}

export async function submitThankYou(
  name: string,
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<ThankYouLedgerResponse> {
  try {
    const response = await fetcher('/api/thank-you', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const payload = await parseJsonSafely<
      Partial<ThankYouLedgerResponse> & { error?: string }
    >(response);

    if (payload) {
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to record Thank You.');
      }
      if (isValidLedgerPayload(payload)) {
        writeLocalRecords(storage, payload.records);
        return payload;
      }
    }
  } catch (err) {
    if (!isNetworkFailure(err)) {
      throw err;
    }
  }

  const localRecords = readLocalRecords(storage);
  const { records: updated, currentRecord } = applyThankYouHit(
    localRecords,
    name,
    new Date().toISOString()
  );
  writeLocalRecords(storage, updated);
  return buildLocalResponse(updated, currentRecord.name, currentRecord);
}

export async function adminUpsertJuniorClient(
  input: {
    targetId?: string;
    name: string;
    hits: number;
    status: ThankYouStatus;
  },
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<ThankYouLedgerResponse> {
  const endpoint = input.targetId
    ? `/api/juniors/${encodeURIComponent(input.targetId)}`
    : '/api/juniors';
  const method = input.targetId ? 'PUT' : 'POST';

  try {
    const response = await fetcher(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const payload = await parseJsonSafely<
      Partial<ThankYouLedgerResponse> & { error?: string }
    >(response);

    if (payload) {
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to save Junior record.');
      }
      if (isValidLedgerPayload(payload)) {
        writeLocalRecords(storage, payload.records);
        return payload;
      }
    }
  } catch (err) {
    if (!isNetworkFailure(err)) {
      throw err;
    }
  }

  const localRecords = readLocalRecords(storage);
  const { records: updated, record } = adminUpsertJunior(
    localRecords,
    input,
    new Date().toISOString()
  );
  writeLocalRecords(storage, updated);
  return buildLocalResponse(updated, null, record);
}

export async function adminDeleteJuniorClient(
  targetId: string,
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<ThankYouLedgerResponse> {
  try {
    const response = await fetcher(
      `/api/juniors/${encodeURIComponent(targetId)}`,
      { method: 'DELETE' }
    );
    const payload = await parseJsonSafely<
      Partial<ThankYouLedgerResponse> & { error?: string }
    >(response);

    if (payload) {
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to delete Junior record.');
      }
      if (isValidLedgerPayload(payload)) {
        writeLocalRecords(storage, payload.records);
        return payload;
      }
    }
  } catch (err) {
    if (!isNetworkFailure(err)) {
      throw err;
    }
  }

  const localRecords = readLocalRecords(storage);
  const updated = adminDeleteJunior(localRecords, targetId);
  writeLocalRecords(storage, updated);
  return buildLocalResponse(updated, null, null);
}

export async function fetchEventConfig(
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<EditableEventConfig> {
  try {
    const response = await fetcher('/api/config');
    const payload = await parseJsonSafely<EditableEventConfig>(response);
    if (response.ok && isValidConfigPayload(payload)) {
      const sanitized = sanitizeEventConfig(payload);
      writeLocalConfig(storage, sanitized);
      return sanitized;
    }
  } catch {
    // Static host -> local config fallback
  }
  return readLocalConfig(storage);
}

export async function saveEventConfig(
  nextConfig: EditableEventConfig,
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<EditableEventConfig> {
  const sanitized = sanitizeEventConfig(nextConfig);
  try {
    const response = await fetcher('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
    const payload = await parseJsonSafely<EditableEventConfig>(response);
    if (response.ok && isValidConfigPayload(payload)) {
      const saved = sanitizeEventConfig(payload);
      writeLocalConfig(storage, saved);
      return saved;
    }
  } catch {
    // Static host -> local config fallback
  }
  writeLocalConfig(storage, sanitized);
  return sanitized;
}

export async function resetEventConfig(
  fetcher: FetchLike = fetch,
  storage: StorageLike | null = getDefaultStorage()
): Promise<EditableEventConfig> {
  try {
    const response = await fetcher('/api/config', { method: 'DELETE' });
    const payload = await parseJsonSafely<EditableEventConfig>(response);
    if (response.ok && isValidConfigPayload(payload)) {
      const saved = sanitizeEventConfig(payload);
      writeLocalConfig(storage, saved);
      return saved;
    }
  } catch {
    // Static host -> local config fallback
  }
  const reset = sanitizeEventConfig(DEFAULT_EVENT_CONFIG);
  writeLocalConfig(storage, reset);
  return reset;
}
