import { useState } from "react";
import {
  Camera,
  DoorClosed,
  Fuel,
  Gem,
  Laptop,
  Watch,
  Zap,
} from "lucide-react";

import { cn } from "@afrotalia/ui/lib/utils";

import type { AuctionIconKind } from "@/lib/mnada";

const ICONS = {
  watch: Watch,
  camera: Camera,
  door: DoorClosed,
  zap: Zap,
  gem: Gem,
  laptop: Laptop,
  generator: Fuel,
} as const;

interface AuctionImageProps {
  title: string;
  icon: AuctionIconKind;
  image?: string;
  className?: string;
}

/**
 * Product visual with graceful fallback. When a real `image` asset exists it
 * is rendered cover-cropped; otherwise a tonal placeholder keeps the layout
 * intact and never distorts.
 */
export default function AuctionImage({ title, icon, image, className }: AuctionImageProps) {
  const [failed, setFailed] = useState(false);
  const Icon = ICONS[icon] ?? Gem;
  const showImg = Boolean(image) && !failed;

  return (
    <div
      className={cn(
        "relative flex h-[198px] w-full items-center justify-center overflow-hidden bg-[#202022]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07),transparent_65%)]"
      />
      <Icon
        aria-hidden
        className="h-[52px] w-[52px] text-white/[0.16]"
        strokeWidth={1.25}
      />
      {showImg ? (
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full rounded-t-[inherit] object-cover"
        />
      ) : null}
      <span className="sr-only">{title}</span>
    </div>
  );
}
