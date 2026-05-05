import type { SessionView } from "@/lib/api/generated/types.gen";

import { z } from "zod";

/**
 * Validation + helpers for the Sentinel `/auth/*` endpoints.
 *
 * Network calls themselves are generated from the OpenAPI spec under
 * `@/lib/api/generated/sdk.gen.ts` (`authMe`, `authSignIn`, `authSignOut`,
 * `authGoogleStart`). This file only keeps:
 *   - `SignInSchema` — the form-side zod that drives TanStack Form validation
 *     in `SignInForm.tsx`. The backend re-validates on receipt; this is for UX.
 *   - `signInWithGoogle()` — top-level navigation (NOT fetch — Google's consent
 *     screen blocks iframes, and `SameSite=Lax` cookies only land on the same
 *     browsing context the user clicked from).
 *   - `oauthErrorMessage()` — friendly copy for `?error=<…>` codes the
 *     `/auth/google/callback` redirect can land on.
 *
 * The HttpOnly `sentinelSession` cookie is the source of truth — JS never
 * reads it. We re-ask the server via `/auth/me` on every cold load (route
 * guards in `__root.tsx` and `login.tsx` use the generated `authMeOptions`).
 */

export type SessionT = SessionView;

export const SignInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean(),
});
export type SignInArgsT = z.infer<typeof SignInSchema>;

/**
 * Server-side OAuth flow.
 *
 * The backend sanitises `return_to` to a same-origin path, so passing
 * `location.pathname + location.search` is safe even if a query string
 * slipped in. Defaults to `/` for the cold-start case (login page).
 *
 * Codes for `?error=<…>` on the callback's redirect to `/login` are
 * documented in `FRONTEND_GOOGLE_AUTH.md` §7 and surfaced by `OAUTH_ERROR_COPY`.
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
