import type { Database } from "@afrotalia/db";
import { enquiry } from "@afrotalia/db/schema/web";
import { and, eq, gte, sql } from "drizzle-orm";

import { DomainError } from "../errors";
import { CONTACT_RATE_LIMIT_WINDOW_MINUTES, isContactRateLimited } from "./contact-rules";

export interface SubmitEnquiryParams {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface SubmitEnquiryResult {
  id: string;
}

export async function submitEnquiry(db: Database, params: SubmitEnquiryParams): Promise<SubmitEnquiryResult> {
  const windowStart = new Date(Date.now() - CONTACT_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
  const [row] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(enquiry)
    .where(and(eq(enquiry.email, params.email), gte(enquiry.createdAt, windowStart)));

  if (isContactRateLimited(row?.count ?? 0)) {
    throw new DomainError("RATE_LIMITED");
  }

  const [inserted] = await db
    .insert(enquiry)
    .values({
      name: params.name,
      email: params.email,
      phone: params.phone,
      message: params.message,
    })
    .returning({ id: enquiry.id });

  return { id: inserted!.id };
}
