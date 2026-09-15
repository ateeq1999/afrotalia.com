import { cn } from "@afrotalia/ui/lib/utils";

export default function SectionRule({ className }: { className?: string }) {
  return <hr className={cn("border-t-2 border-[#18181B]", className)} />;
}
