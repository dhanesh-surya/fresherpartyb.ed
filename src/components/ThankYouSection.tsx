import { CheckCircle2, Clock3, Heart, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { LedgerFilter, ThankYouRecord } from '../types/invitation';
import { summarizeThankYouLedger } from '../utils/invitationLogic';

interface ThankYouSectionProps {
  juniorName: string;
  records: ThankYouRecord[];
  isLoading: boolean;
  isSending: boolean;
  errorMessage: string | null;
  onSendThankYou: () => Promise<void>;
}

function formatShortTime(iso: string | null): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ThankYouSection({
  juniorName,
  records,
  isLoading,
  isSending,
  errorMessage,
  onSendThankYou,
}: ThankYouSectionProps) {
  const [filter, setFilter] = useState<LedgerFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [burstKey, setBurstKey] = useState(0);

  const summary = useMemo(
    () => summarizeThankYouLedger(records, juniorName, filter, searchQuery),
    [records, juniorName, filter, searchQuery]
  );

  const currentRecord = summary.currentRecord;
  const hasThanked = Boolean(currentRecord && currentRecord.hits > 0);

  const handleThankYouClick = async () => {
    setBurstKey((prev) => prev + 1);
    await onSendThankYou();
  };

  return (
    <section
      id="thank-you-wall"
      aria-label="Thank You action and hit status by Junior name"
      className="mt-12 scroll-mt-24 border-t border-[#E8D5C8] pt-10"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold text-[#8C5B2B]">
            Show Your Appreciation
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-[#2B1820] [text-wrap:balance]">
            Send a Thank You to B.Ed. Second Year
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#5C3A45]">
            Tap the Thank You button below to record your appreciation hit under your name, <strong className="font-semibold text-[#2B1820]">{juniorName}</strong>. Every hit updates the live status directory.
          </p>

          <div className="relative mt-6 inline-block">
            <button
              type="button"
              onClick={handleThankYouClick}
              disabled={isSending}
              className={`inline-flex items-center gap-2.5 rounded-xl bg-[#7B1633] px-7 py-4 text-base font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#621028] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633] ${
                burstKey > 0 ? 'animate-neon-ring' : ''
              }`}
            >
              <Heart
                className={`h-5 w-5 ${
                  hasThanked
                    ? 'fill-[#FF5CCD] text-[#FF85D0] drop-shadow-[0_0_8px_rgba(255,46,147,0.85)]'
                    : ''
                }`}
                aria-hidden="true"
              />
              <span>{isSending ? 'Sending Thank You...' : 'Thank You'}</span>
            </button>

            {burstKey > 0 && (
              <div
                key={burstKey}
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 left-1/2 flex -translate-x-1/2 gap-3"
              >
                <span className="animate-petal-burst text-lg drop-shadow-[0_0_10px_#ff2e93]">
                  💖
                </span>
                <span className="animate-petal-burst text-xl drop-shadow-[0_0_12px_#ff007f]">
                  ❤️
                </span>
                <span className="animate-petal-burst text-lg drop-shadow-[0_0_10px_#ff6ec7]">
                  💕
                </span>
              </div>
            )}
          </div>

          <div
            data-testid="current-junior-status"
            className="mt-6 rounded-xl border border-[#E8D5C8] bg-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#6E4B56]">
                Your Thank You Status ({juniorName})
              </span>
              {hasThanked ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534]">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span>Thanked</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C5B2B]">
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  <span>Pending</span>
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-6 border-t border-[#F1E4DC] pt-3">
              <div>
                <div className="font-display text-2xl font-bold text-[#7B1633] tabular-nums">
                  {currentRecord?.hits ?? 0}
                </div>
                <div className="text-xs text-[#6E4B56]">Your Hits</div>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-[#2B1820] tabular-nums">
                  {formatShortTime(currentRecord?.lastHitAt ?? null)}
                </div>
                <div className="text-xs text-[#6E4B56]">Last Hit Time</div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="mt-3 text-sm font-medium text-[#B42318]"
            >
              {errorMessage}
            </p>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[#E8D5C8] bg-white p-6 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#E8D5C8] pb-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-[#2B1820]">
                  Thank You Hit Status by Name
                </h3>
                <p className="mt-0.5 text-xs text-[#6E4B56]">
                  Live status of Juniors who opened the invitation
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5C3A45] tabular-nums">
                <span>
                  <strong className="font-semibold text-[#7B1633]">
                    {summary.totalHits}
                  </strong>{' '}
                  Total Hits
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="font-semibold text-[#2B1820]">
                    {summary.thankedCount}
                  </strong>{' '}
                  Thanked
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="font-semibold text-[#2B1820]">
                    {summary.pendingCount}
                  </strong>{' '}
                  Pending
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                role="tablist"
                aria-label="Filter Junior Thank You status"
                className="inline-flex items-center gap-1 rounded-lg border border-[#E8D5C8] bg-[#FDF8F5] p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'all'}
                  onClick={() => setFilter('all')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-[#7B1633] shadow-xs'
                      : 'text-[#5C3A45] hover:text-[#2B1820]'
                  }`}
                >
                  All ({summary.allRecords.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'thanked'}
                  onClick={() => setFilter('thanked')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    filter === 'thanked'
                      ? 'bg-white text-[#7B1633] shadow-xs'
                      : 'text-[#5C3A45] hover:text-[#2B1820]'
                  }`}
                >
                  Thanked ({summary.thankedCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'pending'}
                  onClick={() => setFilter('pending')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                    filter === 'pending'
                      ? 'bg-white text-[#7B1633] shadow-xs'
                      : 'text-[#5C3A45] hover:text-[#2B1820]'
                  }`}
                >
                  Pending ({summary.pendingCount})
                </button>
              </div>

              <div className="relative w-full sm:w-56">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#8C6A73]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="Search Junior by name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Junior name..."
                  className="w-full rounded-lg border border-[#D8B9A6] bg-[#FDF8F5] py-2 pr-3 pl-8 text-xs text-[#2B1820] placeholder:text-[#9E7D86] focus:border-[#7B1633] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-sm text-[#6E4B56]">
                Loading Thank You status ledger...
              </div>
            ) : summary.records.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#6E4B56]">
                No Juniors match the current filter.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E8D5C8] text-xs font-semibold text-[#6E4B56]">
                      <th className="py-2.5 pr-4">Junior Name</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5 text-right">Hits</th>
                      <th className="py-2.5 pl-3 text-right">Last Hit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E4DC]">
                    {summary.records.map((entry) => {
                      const isSelf =
                        entry.id === juniorName.trim().toLowerCase();
                      return (
                        <tr
                          key={entry.id}
                          className={isSelf ? 'bg-[#FDF4F6]' : undefined}
                        >
                          <td className="py-3 pr-4 font-medium text-[#2B1820]">
                            <span>{entry.name}</span>
                            {isSelf && (
                              <span className="ml-2 text-xs font-semibold text-[#7B1633]">
                                (You)
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {entry.status === 'Thanked' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#166534]">
                                <CheckCircle2
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>Thanked</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C5B2B]">
                                <Clock3
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-[#2B1820] tabular-nums">
                            {entry.hits}
                          </td>
                          <td className="py-3 pl-3 text-right text-xs text-[#6E4B56] tabular-nums">
                            {formatShortTime(entry.lastHitAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
