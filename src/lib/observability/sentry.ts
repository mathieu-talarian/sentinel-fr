import type { AnyRouter } from "@tanstack/react-router";

import * as Sentry from "@sentry/react";

// `import.meta.env` is typed `any` for keys that aren't pre-declared in
// `vite/client`, which trips `no-unsafe-*`. Cast once at the boundary.
const env = import.meta.env as unknown as Record<string, string | undefined>;

const num = (raw: string | undefined, fallback: number): number => {
  const n = raw == null ? Number.NaN : Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Boot Sentry once the router exists.
 *
 * No-ops when `VITE_SENTRY_DSN` is unset so a fresh checkout works without any
 * env wiring; CI / prod set the DSN and the integrations come online.
 *
 * `tanstackRouterBrowserTracingIntegration` needs the live router instance
 * (it subscribes to navigations), which is why this runs from `main.tsx`
 * AFTER `getRouter()` and BEFORE `createRoot().render()`.
 */
export function initSentry(router: AnyRouter): void {
  const dsn = env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: env.VITE_APP_RELEASE,
    sendDefaultPii: true,
    integrations: [
      Sentry.tanstackRouterBrowserTracingIntegration(router),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: num(
      env.VITE_SENTRY_TRACES_SAMPLE_RATE,
      import.meta.env.PROD ? 0.2 : 1,
    ),
    replaysSessionSampleRate: num(
      env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE,
      import.meta.env.PROD ? 0.1 : 0,
    ),
    replaysOnErrorSampleRate: num(env.VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE, 1),
  });
}
