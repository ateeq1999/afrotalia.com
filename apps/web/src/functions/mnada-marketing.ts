import { readSettingNumber } from "@afrotalia/core/mnada/db-helpers";
import { auction } from "@afrotalia/db/schema/mnada";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";

import { getDb } from "@/services";

export interface FeaturedLot {
  id: string;
  lotNumber: number;
  title: string;
  image: string | null;
  currentBid: number;
  openingBid: number;
}

export interface MnadaMarketingContext {
  registrationFeeMinor: number;
  paymentWindowHours: number;
  featuredLots: FeaturedLot[];
}

/**
 * Registration fee and payment window are read live from `mnada_setting` —
 * per the content spec, never printed as a literal in code or copy.
 */
export const getMnadaMarketingContext = createServerFn({ method: "GET" }).handler(
  async (): Promise<MnadaMarketingContext> => {
    const db = getDb();
    const [registrationFeeMinor, paymentWindowHours, featured] = await Promise.all([
      readSettingNumber(db, "registrationFeeMinor", 50_000),
      readSettingNumber(db, "paymentWindowHours", 24),
      db
        .select({
          id: auction.id,
          lotNumber: auction.lotNumber,
          title: auction.title,
          image: auction.image,
          currentBid: auction.currentBid,
          openingBid: auction.openingBid,
        })
        .from(auction)
        .where(eq(auction.featured, true))
        .orderBy(desc(auction.createdAt))
        .limit(3),
    ]);

    return { registrationFeeMinor, paymentWindowHours, featuredLots: featured };
  },
);
