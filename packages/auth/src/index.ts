import type { Database } from "@afrotalia/db";
import * as authSchema from "@afrotalia/db/schema/auth";
import { user } from "@afrotalia/db/schema/auth";
import { mnadaProfile } from "@afrotalia/db/schema/mnada";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { phoneNumber } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { and, eq } from "drizzle-orm";

export type AuthConfig = {
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  /**
   * Comma-separated origins trusted across every Afrotalia subdomain
   * (web, shop, mnada). Falls back to just `BETTER_AUTH_URL` when unset —
   * fine for local dev, where every app runs on its own localhost origin.
   */
  AUTH_TRUSTED_ORIGINS?: string;
  /**
   * Root domain for the shared session cookie, e.g. ".afrotalia.com".
   * Required in production so one sign-in on afrotalia.com is recognized on
   * shop.afrotalia.com and mnada.afrotalia.com. Leave unset in local dev —
   * subdomain cookies don't apply across separate localhost ports.
   */
  COOKIE_DOMAIN?: string;
};

/** Loose E.164 check: "+" then 8-15 digits. */
const E164_RE = /^\+[1-9]\d{7,14}$/;

export function createAuth(env: AuthConfig, database: Database) {
  const trustedOrigins = env.AUTH_TRUSTED_ORIGINS
    ? env.AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [env.BETTER_AUTH_URL];

  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: authSchema,
    }),
    trustedOrigins,
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: env.COOKIE_DOMAIN
      ? { crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN } }
      : undefined,
    plugins: [
      tanstackStartCookies(),
      phoneNumber({
        async phoneNumberValidator(phoneNumberValue) {
          if (!E164_RE.test(phoneNumberValue)) return false;
          // Block phones tied to an already-BLOCKED Mnada profile from re-registering.
          const [blocked] = await database
            .select({ status: mnadaProfile.status })
            .from(mnadaProfile)
            .innerJoin(user, eq(mnadaProfile.userId, user.id))
            .where(and(eq(user.phoneNumber, phoneNumberValue), eq(mnadaProfile.status, "BLOCKED")))
            .limit(1);
          return !blocked;
        },
        async sendOTP({ phoneNumber: phoneNumberValue, code }) {
          // No SMS provider is wired up yet — log instead, same "mock, swap
          // later" pattern as the registration-fee and Shop payment flows.
          console.log(`[mnada] OTP for ${phoneNumberValue}: ${code}`);
        },
        async callbackOnVerification({ user: verifiedUser }) {
          // First verification for this user: create their Mnada profile as
          // PENDING_PAYMENT. Idempotent — never downgrades an existing
          // ACTIVE/BLOCKED profile on a re-verify.
          await database
            .insert(mnadaProfile)
            .values({ userId: verifiedUser.id, status: "PENDING_PAYMENT" })
            .onConflictDoNothing({ target: mnadaProfile.userId });
        },
      }),
    ],
  });
}
