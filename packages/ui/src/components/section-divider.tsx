import type { HTMLAttributes } from "react";

import { cn } from "../lib/utils";

export interface SectionDividerProps extends HTMLAttributes<HTMLHRElement> {
  /** "light" = ink rule on a light surface (Shop, Web). "dark" = hairline on a dark surface (Mnada). */
  surface?: "light" | "dark";
}

/** The editorial 2px section rule used across Web and Shop. */
export function SectionDivider({ surface = "light", className, ...props }: SectionDividerProps) {
  return (
    <hr
      className={cn("border-t-2", surface === "dark" ? "border-dark-hairline" : "border-ink", className)}
      {...props}
    />
  );
}
