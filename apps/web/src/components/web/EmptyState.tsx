import { cn } from "@afrotalia/ui/lib/utils";

/**
 * Clearly-marked placeholder for CMS content that hasn't been supplied yet
 * (registration numbers, founding dates, staff names, addresses, phone
 * numbers, client names, project outcomes — never invented in app code).
 * Label defaults to the content spec's exact required wording; pass a
 * `label` only to describe *what* is missing when the section needs that
 * context (e.g. a field name in a list).
 */
export default function EmptyState({ label = "Supplied by Afrotalia", className }: { label?: string; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex items-center border border-dashed border-hairline bg-surface-subtle px-3 py-2 text-[13px] italic text-caption",
        className,
      )}
    >
      {label}
    </p>
  );
}
