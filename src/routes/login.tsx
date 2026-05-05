import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect } from "@tanstack/solid-router";
import { Show, createSignal } from "solid-js";
import { z } from "zod";

import { TextLink } from "~/components/atoms/TextLink";
import { BrandLockup } from "~/components/molecules/BrandLockup";
import { ErrorBanner } from "~/components/molecules/ErrorBanner";
import { GoogleSignInButton } from "~/components/molecules/GoogleSignInButton";
import { LoginDivider } from "~/components/molecules/LoginDivider";
import { LoginFooter } from "~/components/molecules/LoginFooter";
import { LoginCard } from "~/components/organisms/LoginCard";
import { SignInForm } from "~/components/organisms/SignInForm";
import { oauthErrorMessage, signInWithGoogle } from "~/lib/api/auth";
import { meQueryOptions } from "~/lib/api/queries";
import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

/**
 * Search params for `/login`. The `error` code lands here from
 * `/auth/google/callback` on failure (see FRONTEND_GOOGLE_AUTH.md §7).
 * `next` lets the password form remember where the user was headed.
 */
const LoginSearchSchema = z.object({
  error: z.string().optional(),
  next: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: LoginSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.ensureQueryData(meQueryOptions());
    // If a callback error came back, always show the login page so the user
    // sees the banner — never bounce them to `/` even if a stale hint says
    // they're signed in.
    if (session && !search.error) {
      // `throw: true` lets redirect() throw internally, satisfying
      // typescript-eslint/only-throw-error at the call site.
      redirect({ to: "/", throw: true });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const [googleSubmitting, setGoogleSubmitting] = createSignal(false);

  const handleGoogle = () => {
    setGoogleSubmitting(true);
    signInWithGoogle(search().next);
  };

  const errorMsg = () => oauthErrorMessage(search().error);

  return (
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
        <Show when={errorMsg()}>
          {(msg) => <ErrorBanner message={msg()} />}
        </Show>

        <GoogleSignInButton busy={googleSubmitting()} onClick={handleGoogle} />

        <LoginDivider />

        <SignInForm busy={googleSubmitting()} next={search().next} />

        <p {...sx(s.signupLine)}>
          New to Sentinel? <TextLink>Request access</TextLink>
        </p>
      </LoginCard>

      <LoginFooter />
    </div>
  );
}

const s = stylex.create({
  shell: {
    background: colors.paper2,
    padding: "32px 20px",
    gap: 28,
    alignItems: "center",
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
