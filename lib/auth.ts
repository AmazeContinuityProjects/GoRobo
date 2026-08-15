import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : (process.env.V0_DEV_APP_URL ?? process.env.V0_RUNTIME_URL)),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    // Local dev
    'http://localhost:3000',
    // v0 preview is served through proxy hosts that vary per session
    // (e.g. *.vercel.run sandboxes and *.v0.build preview URLs), so match
    // them with wildcards instead of a single exact origin.
    'https://*.v0.build',
    'https://*.vercel.run',
    'https://*.vercel.app',
    ...(process.env.V0_DEV_APP_URL ? [process.env.V0_DEV_APP_URL] : []),
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          // In dev (v0 preview iframe), the app runs in a cross-site iframe.
          // Chrome blocks third-party cookies by default, so the session
          // cookie must be SameSite=None, Secure AND Partitioned (CHIPS) for
          // the browser to store and send it back inside the iframe.
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
            partitioned: true,
          },
        },
      }
    : {}),
})
