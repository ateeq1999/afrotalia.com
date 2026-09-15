import { DomainError, type DomainErrorCode } from "@afrotalia/core";
import { submitEnquiry as submitEnquiryTx } from "@afrotalia/core/web/submit-enquiry";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getDb } from "@/services";

const submitEnquirySchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10).max(4000),
});

export type SubmitEnquiryResult = { ok: true } | { ok: false; code: DomainErrorCode; message: string };

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(submitEnquirySchema)
  .handler(async ({ data }): Promise<SubmitEnquiryResult> => {
    try {
      await submitEnquiryTx(getDb(), data);
      return { ok: true };
    } catch (err) {
      if (err instanceof DomainError) return { ok: false, code: err.code, message: err.message };
      throw err;
    }
  });
