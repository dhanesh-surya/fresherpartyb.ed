import { useMemo, type CSSProperties } from 'react';

export interface CelebrationBurstPayload {
  id: number;
  mode: 'login' | 'thankyou';
  label?: string;
}

interface CelebrationBurstProps {
  burst: CelebrationBurstPayload | null;
}

const LOGIN_EMOJIS = ['🎊', '🎉', '🥳', '✨', '🎓', '🌸', '💐', '🪩'];
const HEART_EMOJIS = ['❤️', '💖', '💕', '💗', '💓', '💘', '🩷'];

export function CelebrationBurst({ burst }: CelebrationBurstProps) {
  const particles = useMemo(() => {
    if (!burst) return [];
    const palette = burst.mode === 'login' ? LOGIN_EMOJIS : HEART_EMOJIS;
    const count = burst.mode === 'login' ? 28 : 26;

    return Array.from({ length: count }, (_, idx) => {
      const spread = (idx / (count - 1)) * 2 - 1;
      const angle = spread * Math.PI * 0.78;
      const distance = 150 + ((idx * 47) % 210);
      const tx =
        burst.mode === 'login'
          ? Math.round(Math.sin(angle) * distance * 1.45)
          : Math.round(spread * 240);
      const ty =
        burst.mode === 'login'
          ? Math.round(-Math.abs(Math.cos(angle)) * distance - 60)
          : Math.round(-220 - ((idx * 37) % 220));
      const rot = ((idx % 2 === 0 ? 1 : -1) * (18 + ((idx * 23) % 70)));
      const delayMs = (idx % 6) * 55;
      const leftPct =
        burst.mode === 'login' ? 50 + spread * 18 : 16 + ((idx * 7) % 68);
      const topPct = burst.mode === 'login' ? 52 : 76;

      return {
        key: `${burst.id}-${idx}`,
        emoji: palette[idx % palette.length],
        leftPct,
        topPct,
        delayMs,
        sizePx: 24 + (idx % 4) * 6,
        style: {
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--rot': `${rot}deg`,
          animationDelay: `${delayMs}ms`,
        } as CSSProperties,
      };
    });
  }, [burst]);

  if (!burst) return null;

  return (
    <div
      key={burst.id}
      aria-live="polite"
      aria-atomic="true"
      data-testid={`celebration-burst-${burst.mode}`}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {particles.map((item) => (
        <span
          key={item.key}
          aria-hidden="true"
          style={{
            left: `${item.leftPct}%`,
            top: `${item.topPct}%`,
            fontSize: `${item.sizePx}px`,
            ...item.style,
          }}
          className={`absolute select-none leading-none ${
            burst.mode === 'login'
              ? 'animate-celebration-blast'
              : 'animate-neon-heart'
          }`}
        >
          {item.emoji}
        </span>
      ))}

      {burst.label && (
        <div className="fixed inset-x-0 top-20 flex justify-center px-4">
          <div
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md ${
              burst.mode === 'thankyou'
                ? 'border border-[#FF5CCD]/50 bg-[#2B0C1E]/95 text-[#FFD6EC] shadow-[0_0_24px_rgba(255,46,147,0.45)]'
                : 'border border-[#E8D5C8] bg-white/95 text-[#7B1633]'
            }`}
          >
            {burst.label}
          </div>
        </div>
      )}
    </div>
  );
}
