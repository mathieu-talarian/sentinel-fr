import type { AnyRouter } from "@tanstack/react-router";

import * as Sentry from "@sentry/react";

// `import.meta.env` is typed `any` for keys that aren't pre-declared in
// `vite/client`, which trips `no-unsafe-*`. Cast once at the boundary.
const env = import.meta.env as unknown as Record<string, string | undefined>;

const num = (raw: string | undefined, fallback: number): number => {
  const n = raw == null ? Number.NaN : Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
};

// Same-origin `/api/...` calls always need trace propagation so frontend
// transactions stitch to backend ones. Cross-origin prod backends (different
// host than the SPA) override via `VITE_SENTRY_TRACE_TARGETS`, comma-
// separated. The default regex matches `/api/...` after Vite proxy /
// reverse-proxy routing.
const tracePropagationTargets = (): (string | RegExp)[] => {
  const fromEnv = env.VITE_SENTRY_TRACE_TARGETS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv && fromEnv.length > 0 ? fromEnv : [/^\/api\//];
};

// Drop noise that pollutes the issue feed without ever being actionable:
// - ResizeObserver loop notifications (browser quirk, not an app bug)
// - Aborted fetches (TanStack Query unmount, user-driven Stop)
// - Bare `Failed to fetch` from offline tabs
const NOISE_PATTERNS = [
  /ResizeObserver loop/i,
  /^AbortError$/,
  /aborted/i,
  /Failed to fetch/i,
  /Load failed/i,
];

const messageFromException = (ex: unknown, fallback: string): string => {
  if (ex instanceof Error) return ex.message;
  if (typeof ex === "string") return ex;
  return fallback;
};

const beforeSend: NonNullable<
  Parameters<typeof Sentry.init>[0]
>["beforeSend"] = (event, hint) => {
  const message = messageFromException(
    hint.originalException,
    event.message ?? "",
  );
  return NOISE_PATTERNS.some((p) => p.test(message)) ? null : event;
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
    // Tunnel envelopes through the same-origin Rust backend when set.
    // Bypasses ad-blockers (`*.ingest.sentry.io` is on most blocklists)
    // and avoids a CORS preflight per event. Backend handler must accept
    // POST and forward bytes verbatim to `https://o<orgId>.ingest.sentry.io
    // /api/<projectId>/envelope/`.
    tunnel: env.VITE_SENTRY_TUNNEL,
    environment: import.meta.env.MODE,
    release: env.VITE_APP_RELEASE,
    sendDefaultPii: true,
    beforeSend,
    integrations: [
      Sentry.tanstackRouterBrowserTracingIntegration(router),
      // Captures CPU profiles for sampled transactions. Real fidelity needs
      // the response header `Document-Policy: js-profiling` from the
      // server hosting index.html — without it the integration still works
      // but profiles are coarser. Profiling only fires when both
      // `tracesSampleRate` and `profilesSampleRate` are > 0.
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: num(
      env.VITE_SENTRY_TRACES_SAMPLE_RATE,
      import.meta.env.PROD ? 0.2 : 1,
    ),
    // Continuous profiling (v10+ API). `trace` lifecycle ties each profile
    // to a sampled transaction — same effective semantics as the legacy
    // `profilesSampleRate` but with the v10-native option names.
    profileSessionSampleRate: num(
      env.VITE_SENTRY_PROFILE_SESSION_SAMPLE_RATE,
      import.meta.env.PROD ? 0.1 : 1,
    ),
    profileLifecycle: "trace",
    // Forwards `sentry-trace` + `baggage` headers on outgoing fetch/xhr to
    // matching URLs so backend spans link to frontend transactions.
    tracePropagationTargets: tracePropagationTargets(),
    replaysSessionSampleRate: num(
      env.VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE,
      import.meta.env.PROD ? 0.1 : 0,
    ),
    replaysOnErrorSampleRate: num(env.VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE, 1),
  });
}
