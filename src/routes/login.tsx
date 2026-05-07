/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { TextLink } from "@/components/atoms/TextLink";
import { BrandLockup } from "@/components/molecules/BrandLockup";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { GoogleSignInButton } from "@/components/molecules/GoogleSignInButton";
import { LoginFooter } from "@/components/molecules/LoginFooter";
import { LoginCard } from "@/components/organisms/LoginCard";
import { popupErrorMessage } from "@/lib/firebase/auth";
import { useAuth } from "@/lib/state/auth";
import { signInWithGoogle } from "@/lib/state/authThunks";
import { useAppDispatch } from "@/lib/state/hooks";
import { store } from "@/lib/state/store";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

/**
 * Search params for `/login`. `next` lets the page bounce the user back
 * to wherever they came from after a successful Firebase sign-in.
 */
const LoginSearchSchema = z.object({
  next: z.string().optional(),
});

const safeReturnPath = (next: string | undefined): string => {
  if (next && next.startsWith("/") && !next.startsWith("/login")) return next;
  return "/";
};

export const Route = createFileRoute("/login")({
  validateSearch: LoginSearchSchema,
  // `subscribeAuth` in main.tsx awaits the first onAuthStateChanged callback
  // before mounting React, so by the time `beforeLoad` runs the slice has
  // already settled on `authed` or `anon` — never `loading`.
  beforeLoad: ({ search }) => {
    const { status } = store.getState().auth;
    if (status === "authed") {
      redirect({ to: safeReturnPath(search.next), throw: true });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect once the auth slice flips to `authed` (the popup completes
  // asynchronously and `subscribeAuth` will dispatch `setAuthed`).
  useEffect(() => {
    if (auth.status === "authed") {
      void navigate({ to: safeReturnPath(search.next) });
    }
  }, [auth.status, search.next, navigate]);

  const onGoogle = () => {
    setSigningIn(true);
    setError(null);
    void (async () => {
      try {
        await dispatch(signInWithGoogle);
        // onAuthStateChanged finishes the rest; the useEffect above redirects.
      } catch (error_) {
        const msg = popupErrorMessage(error_);
        Sentry.addBreadcrumb({
          category: "auth",
          level: "warning",
          message: "Google popup error",
          data: { error: msg },
        });
        setError(msg);
        setSigningIn(false);
      }
    })();
  };

  return (
    <Sentry.ErrorBoundary
      fallback={(p) => (
        <ErrorFallback
          error={p.error}
          resetError={() => {
            p.resetError();
          }}
        />
      )}
    >
      <div {...sx(s.shell)}>
        <BrandLockup size="md" />

        <LoginCard
          title={
            <>
              <em {...sx(s.titleEm)}>Welcome</em> back
            </>
          }
          subtitle="Sign in to continue."
        >
          {error && <ErrorBanner message={error} />}

          <GoogleSignInButton busy={signingIn} onClick={onGoogle} />

          <p {...sx(s.signupLine)}>
            New to Sentinel? <TextLink>Request access</TextLink>
          </p>
        </LoginCard>

        <LoginFooter />
      </div>
    </Sentry.ErrorBoundary>
  );
}

const s = stylex.create({
  shell: {
    padding: "32px 20px",
    gap: 28,
    alignItems: "center",
    backgroundColor: colors.paper2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
  },
  titleEm: {
    color: colors.goldDeep,
    fontFamily: fonts.serif,
    fontStyle: "italic",
  },
  signupLine: {
    margin: 0,
    color: colors.ink3,
    fontSize: 13,
    textAlign: "center",
  },
});
