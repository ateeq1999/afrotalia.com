import { cn } from "@afrotalia/ui/lib/utils";

/**
 * Clearly-marked placeholder for CMS content that hasn't been supplied yet
 * (registration numbers, founding dates, staff names, addresses, phone
 * numbers, client names, project outcomes — never invented in app code).
 */
export default function EmptyState({ label, className }: { label: string; className?: string }) {
  return (
    <p className={cn("border border-dashed border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2 text-[13px] italic text-[#8F8F98]", className)}>
      {label}
    </p>
  );
}
