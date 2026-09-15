import { useState } from "react";
import { Package } from "lucide-react";

import { cn } from "@afrotalia/ui/lib/utils";

export default function ProductImage({
  name,
  image,
  className,
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(image) && !failed;

  return (
    <div
      className={cn(
        "relative flex h-[180px] w-full items-center justify-center overflow-hidden bg-surface-muted",
        className,
      )}
    >
      <Package aria-hidden className="h-10 w-10 text-black/[0.14]" strokeWidth={1.25} />
      {showImg ? (
        <img
          src={image ?? undefined}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <span className="sr-only">{name}</span>
    </div>
  );
}
