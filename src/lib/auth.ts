import { z } from "zod";

/**
 * Auth schemas + fetch helpers for the Sentinel `/auth/*` endpoints.
 *
 * Validation runs at the network boundary (zod parses both incoming session
 * envelopes and outgoing form submissions). Caching + invalidation lives in
 * `~/lib/queries.ts`; the route guards consume that via TanStack Query.
 *
 * The HttpOnly `sentinel_session` cookie is the source of truth — we never
 * read it from JS. The optional localStorage hint just lets the first paint
 * pick the right route before `/auth/me` returns.
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

const HINT_KEY = "sentinel.session.hint.v1";

export function loadSessionHint(): SessionT | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(HINT_KEY);
    if (!raw) return null;
    return SessionSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistSessionHint(s: SessionT | null) {
  try {
    if (s) localStorage.setItem(HINT_KEY, JSON.stringify(s));
    else localStorage.removeItem(HINT_KEY);
  } catch {
    // localStorage may be unavailable (private mode) — non-fatal.
  }
}

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

/** Server-side OAuth flow — backend handles everything, lands the user on `/`. */
export function signInWithGoogle(): void {
  globalThis.location.href = "/auth/google/start";
}

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
