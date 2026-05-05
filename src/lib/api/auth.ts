import { z } from "zod";

/**
 * Auth schemas + fetch helpers for the Sentinel `/auth/*` endpoints.
 *
 * Validation runs at the network boundary (zod parses both incoming session
 * envelopes and outgoing form submissions). Caching + invalidation lives in
 * `~/lib/queries.ts`; the route guards consume that via TanStack Query.
 *
 * The HttpOnly `sentinel_session` cookie is the source of truth — JS never
 * reads it. We re-ask the server via `/auth/me` on every cold load.
 */

export const SessionSchema = z.object({
  email: z.email(),
  expires_at: z.iso.datetime({ offset: true }),
});
export type SessionT = z.infer<typeof SessionSchema>;

const SessionEnvelopeSchema = z.object({ session: SessionSchema });

export const SignInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean(),
});
export type SignInArgsT = z.infer<typeof SignInSchema>;

const buildHeaders = () => ({
  "content-type": "application/json",
  "x-request-id": crypto.randomUUID(),
});

async function throwAsProblem(r: Response): Promise<never> {
  const problem = (await r.json().catch(() => ({}))) as {
    title?: string;
    detail?: string;
  };
  throw new Error(
    problem.detail ??
      problem.title ??
      `Request failed (${r.status.toString()}).`,
  );
}

export async function signIn(args: SignInArgsT): Promise<SessionT> {
  const r = await fetch("/auth/sign-in", {
    method: "POST",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify({
      email: args.email,
      password: args.password,
      remember_me: args.rememberMe,
    }),
  });
  if (!r.ok) await throwAsProblem(r);
  return SessionEnvelopeSchema.parse(await r.json()).session;
}

/**
 * Server-side OAuth flow.
 *
 * Top-level navigation (NOT fetch) — Google's consent screen blocks iframes,
 * and `SameSite=Lax` cookies only land on the same browsing context the user
 * clicked from. The backend sanitises `return_to` to a same-origin path, so
 * passing `location.pathname + location.search` is safe even if a query
 * string slipped in. Defaults to `/` for the cold-start case (login page).
 *
 * Codes for `?error=<…>` on the callback's redirect to `/login` are documented
 * in `FRONTEND_GOOGLE_AUTH.md` §7 and surfaced by `OAUTH_ERROR_COPY`.
 */
export function signInWithGoogle(returnTo?: string): void {
  const fromLocation =
    globalThis.location.pathname + globalThis.location.search;
  const candidate = returnTo ?? fromLocation;
  // Avoid bouncing the user back to `/login` after a successful sign-in.
  const safe =
    candidate.startsWith("/") && !candidate.startsWith("/login")
      ? candidate
      : "/";
  globalThis.location.href = `/auth/google/start?return_to=${encodeURIComponent(safe)}`;
}

export const OAUTH_ERROR_COPY: Record<string, string> = {
  state_mismatch: "Sign-in expired. Please try again.",
  google_denied: "Sign-in cancelled. Try again whenever you're ready.",
  email_unverified:
    "Your Google account doesn't have a verified email. Verify it with Google and try again.",
  provider_unavailable:
    "Google is unavailable right now. Please try again in a minute.",
};

export const oauthErrorMessage = (code: string | undefined): string | null => {
  if (!code) return null;
  return OAUTH_ERROR_COPY[code] ?? "Sign-in failed. Please try again.";
};

export async function signOut(): Promise<void> {
  await fetch("/auth/sign-out", {
    method: "POST",
    credentials: "include",
    headers: { "x-request-id": crypto.randomUUID() },
  }).catch(() => {
    // Best-effort — even if the network call fails we still clear local state.
  });
}

export async function fetchMe(): Promise<SessionT | null> {
  const r = await fetch("/auth/me", { credentials: "include" });
  if (r.status === 401) return null;
  if (!r.ok) throw new Error(`/auth/me: ${r.status.toString()}`);
  return SessionEnvelopeSchema.parse(await r.json()).session;
}
