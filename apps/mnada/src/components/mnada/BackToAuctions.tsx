import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function BackToAuctions() {
  return (
    <Link
      to="/"
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-transparent px-3 text-[13px] font-medium text-[#929296] transition-colors hover:border-white/[0.16] hover:text-[#F5F5F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFBF19]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      All auctions
    </Link>
  );
}
