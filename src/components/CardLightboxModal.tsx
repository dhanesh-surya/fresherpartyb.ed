import { X } from 'lucide-react';
import { useEffect } from 'react';
import { EVENT_INFO, INVITATION_IMAGE_PATH } from '../utils/invitationLogic';

interface CardLightboxModalProps {
  isOpen: boolean;
  juniorName: string;
  onClose: () => void;
}

export function CardLightboxModal({
  isOpen,
  juniorName,
  onClose,
}: CardLightboxModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-size Fresher Party Invitation Card"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-[#FDF8F5] p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-4 border-b border-[#E8D5C8] pb-3">
          <div>
            <p className="text-xs font-semibold text-[#7B1633]">
              Dear {juniorName}
            </p>
            <p className="text-xs text-[#6E4B56]">
              {EVENT_INFO.organiser} · {EVENT_INFO.dateDisplay}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close full card view"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8B9A6] bg-white text-[#2B1820] transition-colors hover:border-[#7B1633] hover:text-[#7B1633] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-auto rounded-xl bg-white">
          <img
            src={INVITATION_IMAGE_PATH}
            alt={`Full invitation card for ${juniorName}`}
            referrerPolicy="no-referrer"
            className="mx-auto block h-auto max-h-[76vh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
