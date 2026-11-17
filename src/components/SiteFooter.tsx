interface SiteFooterProps {
  rightSummary: string;
}

export function SiteFooter({ rightSummary }: SiteFooterProps) {
  return (
    <footer className="mt-14 border-t border-[#E8D5C8] pt-6 text-xs text-[#6E4B56]">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-left">
          <span className="block sm:inline">Developed by</span>{' '}
          <a
            href="https://dnstechsupport.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-semibold text-[#7B1633] underline-offset-4 hover:underline sm:inline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B1633]"
          >
            dnstechsupport.com
          </a>
        </div>
        <p className="text-left sm:text-right">{rightSummary}</p>
      </div>
    </footer>
  );
}
