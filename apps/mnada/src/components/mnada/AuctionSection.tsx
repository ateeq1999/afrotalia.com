import type { ReactNode } from "react";

interface AuctionSectionProps {
  id?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}

export default function AuctionSection({ id, title, aside, children }: AuctionSectionProps) {
  return (
    <section id={id} aria-label={title} className="mt-8 scroll-mt-24">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[1px] text-[#F5F5F5]">
          {title}
        </h2>
        {aside ? (
          <p className="shrink-0 text-[11px] text-[#929296]">{aside}</p>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}
