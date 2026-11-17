import { Expand, GraduationCap, Heart, Sparkles } from 'lucide-react';
import { useState, type MouseEvent } from 'react';
import type { EditableEventConfig } from '../types/invitation';
import { INVITATION_IMAGE_PATH } from '../utils/invitationLogic';

interface InvitationCardStageProps {
  juniorName: string;
  eventConfig: EditableEventConfig;
  onExpandCard: () => void;
}

export function InvitationCardStage({
  juniorName,
  eventConfig,
  onExpandCard,
}: InvitationCardStageProps) {
  const [viewMode, setViewMode] = useState<'poster' | 'interactive'>('poster');
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [imageFailed, setImageFailed] = useState(false);

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: Number((-y * 6).toFixed(2)),
      rotateY: Number((x * 6).toFixed(2)),
    });
  };

  const resetTilt = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <section
      id="invitation-card"
      aria-label="Fresher Party Invitation Card"
      className="flex flex-col scroll-mt-24"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Card display mode"
          className="inline-flex items-center gap-1 rounded-lg border border-[#E8D5C8] bg-white p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'poster'}
            onClick={() => setViewMode('poster')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
              viewMode === 'poster'
                ? 'bg-[#7B1633] text-white'
                : 'text-[#5C3A45] hover:text-[#2B1820]'
            }`}
          >
            Invitation Card
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'interactive'}
            onClick={() => setViewMode('interactive')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 ${
              viewMode === 'interactive'
                ? 'bg-[#7B1633] text-white'
                : 'text-[#5C3A45] hover:text-[#2B1820]'
            }`}
          >
            Personalised View
          </button>
        </div>

        {viewMode === 'poster' && !imageFailed && (
          <button
            type="button"
            onClick={onExpandCard}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8B9A6] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#2B1820] whitespace-nowrap shrink-0 transition-colors duration-150 hover:border-[#7B1633] hover:text-[#7B1633] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
          >
            <Expand className="h-3.5 w-3.5" aria-hidden="true" />
            <span>View Full Card</span>
          </button>
        )}
      </div>

      <div
        onMouseMove={handlePointerMove}
        onMouseLeave={resetTilt}
        className="perspective-[1200px]"
      >
        <div
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
          }}
          className="transition-transform duration-200 ease-out will-change-transform"
        >
          {viewMode === 'poster' && !imageFailed ? (
            <div className="overflow-hidden rounded-2xl border border-[#DFC3B0] bg-white p-3 shadow-sm">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={INVITATION_IMAGE_PATH}
                  alt={`Fresher Party Invitation Card for ${juniorName}, ${eventConfig.organiser} on ${eventConfig.dateDisplay}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImageFailed(true)}
                  className="block h-auto w-full object-cover"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#6E4B56]">
                <span>
                  Prepared for{' '}
                  <strong className="font-semibold text-[#2B1820]">
                    {juniorName}
                  </strong>
                </span>
                <span>{eventConfig.organiser}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#D9B684] bg-gradient-to-b from-[#FFF8F6] via-[#FFFDFE] to-[#FDF1F4] p-8 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#D9B684] bg-[#FDF8F5] text-[#7B1633]">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>

              <p className="mt-4 text-xs font-semibold tracking-wider text-[#8C5B2B]">
                {eventConfig.kicker}
              </p>

              <h2 className="mt-2 font-display text-4xl font-bold italic text-[#7B1633] sm:text-5xl">
                {eventConfig.title}
              </h2>

              <p className="mt-5 font-display text-2xl font-semibold text-[#9C1C40]">
                Dear {juniorName},
              </p>

              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#3E242C]">
                {eventConfig.subGreeting}
              </p>

              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#5C3A45]">
                {eventConfig.inviteLine}
              </p>

              <div className="mx-auto mt-7 max-w-md space-y-2.5 border-y border-[#E8D5C8] py-5 text-sm text-[#2B1820]">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[#6E4B56]">Date</span>
                  <span className="font-semibold tabular-nums">
                    {eventConfig.dateDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[#6E4B56]">Time</span>
                  <span className="font-semibold tabular-nums">
                    {eventConfig.timeDisplay}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium text-[#6E4B56]">Venue</span>
                  <span className="font-semibold">
                    {eventConfig.venueDisplay}
                  </span>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-md text-left">
                <p className="text-center text-xs font-semibold text-[#7B1633]">
                  Dress Code (Formal)
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#FDF2F6] p-3.5">
                    <p className="text-xs font-semibold text-[#7B1633]">
                      {eventConfig.dressCode.girls.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2B1820]">
                      {eventConfig.dressCode.girls.attire}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F5F2F3] p-3.5">
                    <p className="text-xs font-semibold text-[#2B1820]">
                      {eventConfig.dressCode.boys.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[#2B1820]">
                      {eventConfig.dressCode.boys.attire}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-6 flex items-center justify-center gap-1.5 font-display text-base italic text-[#7B1633]">
                <Heart className="h-4 w-4" aria-hidden="true" />
                <span>{eventConfig.closingLine}</span>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </p>

              <p className="mt-4 text-xs font-semibold text-[#8C5B2B]">
                {eventConfig.organiser}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
