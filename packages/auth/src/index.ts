import type { Database } from "@afrotalia/db";
import * as schema from "@afrotalia/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

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

export function createAuth(env: AuthConfig, database: Database) {
  const trustedOrigins = env.AUTH_TRUSTED_ORIGINS
    ? env.AUTH_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [env.BETTER_AUTH_URL];

  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema,
    }),
    trustedOrigins,
    emailAndPassword: { enabled: true },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: env.COOKIE_DOMAIN
      ? { crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN } }
      : undefined,
    plugins: [tanstackStartCookies()],
  });
}
