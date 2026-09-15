export const CONTACT_RATE_LIMIT_WINDOW_MINUTES = 10;
export const CONTACT_RATE_LIMIT_MAX_SUBMISSIONS = 3;

/** True once `recentCount` (submissions from this email within the window) has hit the cap. */
export function isContactRateLimited(recentCount: number): boolean {
  return recentCount >= CONTACT_RATE_LIMIT_MAX_SUBMISSIONS;
}
