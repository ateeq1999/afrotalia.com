import { describe, expect, it } from "vitest";

import { CONTACT_RATE_LIMIT_MAX_SUBMISSIONS, isContactRateLimited } from "./contact-rules";

describe("isContactRateLimited", () => {
  it("is false below the cap", () => {
    expect(isContactRateLimited(CONTACT_RATE_LIMIT_MAX_SUBMISSIONS - 1)).toBe(false);
  });

  it("is true at and beyond the cap", () => {
    expect(isContactRateLimited(CONTACT_RATE_LIMIT_MAX_SUBMISSIONS)).toBe(true);
    expect(isContactRateLimited(CONTACT_RATE_LIMIT_MAX_SUBMISSIONS + 1)).toBe(true);
  });

  it("is false with no prior submissions", () => {
    expect(isContactRateLimited(0)).toBe(false);
  });
});
