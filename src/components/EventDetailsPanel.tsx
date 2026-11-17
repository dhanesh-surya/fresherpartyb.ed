import { CalendarPlus, Check, Clock, Copy, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DressCodeGroup } from '../types/invitation';
import {
  buildCalendarIcs,
  EVENT_INFO,
  getEventCountdown,
} from '../utils/invitationLogic';

interface EventDetailsPanelProps {
  juniorName: string;
}

export function EventDetailsPanel({ juniorName }: EventDetailsPanelProps) {
  const [dressGroup, setDressGroup] = useState<DressCodeGroup>('girls');
  const [copiedVenue, setCopiedVenue] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    getEventCountdown(new Date())
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getEventCountdown(new Date()));
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const handleCopyVenue = async () => {
    const text = `Fresher Party (${EVENT_INFO.organiser}) · ${EVENT_INFO.dateDisplay} · ${EVENT_INFO.timeDisplay} · ${EVENT_INFO.venueDisplay}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVenue(true);
      window.setTimeout(() => setCopiedVenue(false), 2200);
    } catch {
      setCopiedVenue(false);
    }
  };

  const handleDownloadCalendar = () => {
    const icsContent = buildCalendarIcs(juniorName);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bed-fresher-party-2026.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeDress = EVENT_INFO.dressCode[dressGroup];

  return (
    <div className="space-y-8">
      <section aria-label="Personalized greeting">
        <p className="text-xs font-semibold tracking-wide text-[#8C5B2B]">
          {EVENT_INFO.kicker} · {EVENT_INFO.organiser}
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,3.4vw,3rem)] font-bold leading-[1.12] tracking-tight text-[#2B1820] [text-wrap:balance]">
          Dear {juniorName},
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#5C3A45]">
          {EVENT_INFO.subGreeting} {EVENT_INFO.inviteLine}
        </p>
      </section>

      <section
        id="event-details"
        aria-label="Event countdown and schedule"
        className="scroll-mt-24 border-t border-[#E8D5C8] pt-7"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-semibold text-[#2B1820]">
            Event Schedule
          </h2>
          <span className="text-xs font-medium text-[#7B1633] tabular-nums">
            {countdown.summary}
          </span>
        </div>

        {countdown.phase === 'upcoming' && (
          <div className="mt-4 grid grid-cols-3 gap-4 border-b border-[#E8D5C8] pb-5">
            <div>
              <div className="font-display text-2xl font-bold text-[#7B1633] tabular-nums">
                {String(countdown.days).padStart(2, '0')}
              </div>
              <div className="mt-0.5 text-xs text-[#6E4B56]">Days</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-[#7B1633] tabular-nums">
                {String(countdown.hours).padStart(2, '0')}
              </div>
              <div className="mt-0.5 text-xs text-[#6E4B56]">Hours</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-[#7B1633] tabular-nums">
                {String(countdown.minutes).padStart(2, '0')}
              </div>
              <div className="mt-0.5 text-xs text-[#6E4B56]">Minutes</div>
            </div>
          </div>
        )}

        <dl className="mt-5 space-y-3.5 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 font-medium text-[#6E4B56]">
              <CalendarPlus className="h-4 w-4 text-[#7B1633]" aria-hidden="true" />
              <span>Date</span>
            </dt>
            <dd className="text-right font-semibold text-[#2B1820] tabular-nums">
              {EVENT_INFO.dateDisplay} ({EVENT_INFO.dateFull})
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 font-medium text-[#6E4B56]">
              <Clock className="h-4 w-4 text-[#7B1633]" aria-hidden="true" />
              <span>Time</span>
            </dt>
            <dd className="text-right font-semibold text-[#2B1820] tabular-nums">
              {EVENT_INFO.timeDisplay}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="flex items-center gap-2 font-medium text-[#6E4B56]">
              <MapPin className="h-4 w-4 text-[#7B1633]" aria-hidden="true" />
              <span>Venue</span>
            </dt>
            <dd className="text-right font-semibold text-[#2B1820]">
              {EVENT_INFO.venueDisplay}
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadCalendar}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D8B9A6] bg-white px-4 py-2.5 text-xs font-semibold text-[#2B1820] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#7B1633] hover:text-[#7B1633] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden="true" />
            <span>Add to Calendar</span>
          </button>

          <button
            type="button"
            onClick={handleCopyVenue}
            className="inline-flex items-center gap-2 rounded-lg border border-[#D8B9A6] bg-white px-4 py-2.5 text-xs font-semibold text-[#2B1820] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#7B1633] hover:text-[#7B1633] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
          >
            {copiedVenue ? (
              <Check className="h-4 w-4 text-[#166534]" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{copiedVenue ? 'Venue Copied' : 'Copy Venue Details'}</span>
          </button>
        </div>
      </section>

      <section
        id="dress-code"
        aria-label="Formal dress code"
        className="scroll-mt-24 border-t border-[#E8D5C8] pt-7"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#2B1820]">
              Dress Code (Formal)
            </h2>
            <p className="mt-0.5 text-xs text-[#6E4B56]">
              Select your group to preview palette and attire guidance
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Dress code group"
            className="inline-flex items-center gap-1 rounded-lg border border-[#E8D5C8] bg-white p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={dressGroup === 'girls'}
              onClick={() => setDressGroup('girls')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
                dressGroup === 'girls'
                  ? 'bg-[#7B1633] text-white'
                  : 'text-[#5C3A45] hover:text-[#2B1820]'
              }`}
            >
              Girls
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={dressGroup === 'boys'}
              onClick={() => setDressGroup('boys')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
                dressGroup === 'boys'
                  ? 'bg-[#7B1633] text-white'
                  : 'text-[#5C3A45] hover:text-[#2B1820]'
              }`}
            >
              Boys
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#E8D5C8] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#7B1633]">
                {activeDress.label} Formal Attire
              </p>
              <p className="mt-1 text-base font-semibold text-[#2B1820]">
                {activeDress.attire}
              </p>
            </div>
            <div className="flex items-center gap-2" aria-label="Recommended fabric colors">
              {activeDress.swatches.map((swatch) => (
                <div key={swatch.name} className="flex items-center gap-1.5">
                  <span
                    className="h-5 w-5 rounded-md border border-black/15"
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.name}
                  />
                  <span className="text-xs text-[#6E4B56]">{swatch.name}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-2.5 text-sm text-[#5C3A45]">{activeDress.detail}</p>
        </div>
      </section>
    </div>
  );
}
