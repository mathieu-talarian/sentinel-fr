import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect } from "@tanstack/solid-router";
import { Show, createSignal } from "solid-js";

import { signInWithGoogle } from "~/lib/auth";
import { meQueryOptions } from "~/lib/queries";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii, shadows } from "~/lib/tokens.stylex";

import { SignInForm } from "./-login/SignInForm";
import { Spinner } from "./-login/Spinner";
import { GoogleLogo } from "./-login/icons";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(meQueryOptions());
    if (session) {
      // `throw: true` lets redirect() throw internally, satisfying
      // typescript-eslint/only-throw-error at the call site.
      redirect({ to: "/", throw: true });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [googleSubmitting, setGoogleSubmitting] = createSignal(false);

  const handleGoogle = () => {
    setGoogleSubmitting(true);
    signInWithGoogle();
  };

  return (
    <div {...sx(s.shell)}>
      <div {...sx(s.brand)}>
        <span {...sx(s.brandMark)}>S</span>
        <span>Sentinel</span>
      </div>

      <div {...sx(s.card)}>
        <div {...sx(s.head)}>
          <h1 {...sx(s.title)}>
            <em {...sx(s.titleEm)}>Welcome</em> back
          </h1>
          <p {...sx(s.sub)}>Sign in to continue.</p>
        </div>

        <button
          type="button"
          {...sx(s.googleBtn)}
          onClick={handleGoogle}
          disabled={googleSubmitting()}
        >
          <Show
            when={googleSubmitting()}
            fallback={
              <>
                <GoogleLogo />
                <span>Continue with Google</span>
              </>
            }
          >
            <Spinner tone="ink" />
            <span>Connecting to Google…</span>
          </Show>
        </button>

        <div {...sx(s.divider)} aria-hidden="true">
          or
        </div>

        <SignInForm busy={googleSubmitting()} />

        <p {...sx(s.signupLine)}>
          New to Sentinel?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); }}>
            Request access
          </a>
        </p>
      </div>

      <div {...sx(s.foot)}>
        <a href="#" onClick={(e) => { e.preventDefault(); }}>
          Privacy
        </a>
        <span {...sx(s.footSep)}>·</span>
        <a href="#" onClick={(e) => { e.preventDefault(); }}>
          Terms
        </a>
        <span {...sx(s.footSep)}>·</span>
        <a href="#" onClick={(e) => { e.preventDefault(); }}>
          Status
        </a>
      </div>
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
  brand: {
    gap: 9,
    alignItems: "center",
    color: colors.ink,
    display: "flex",
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  brandMark: {
    background: colors.ink,
    borderRadius: 6,
    placeItems: "center",
    color: colors.paper,
    display: "grid",
    fontFamily: fonts.serif,
    fontSize: 15,
    fontStyle: "italic",
    fontWeight: 600,
    height: 26,
    width: 26,
  },
  card: {
    background: colors.paper,
    padding: "32px 28px",
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 22,
    boxShadow: shadows.md,
    display: "flex",
    flexDirection: "column",
    maxWidth: 380,
    width: "100%",
  },
  head: {
    gap: 4,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  title: {
    margin: 0,
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 26,
    fontWeight: 400,
    letterSpacing: "-0.015em",
    lineHeight: 1.2,
  },
  titleEm: { color: colors.goldDeep, fontStyle: "italic" },
  sub: { margin: 0, color: colors.ink3, fontSize: 13 },
  divider: {
    gap: 12,
    alignItems: "center",
    color: colors.ink4,
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    "::after": {
      background: colors.line,
      flex: "1",
      content: '""',
      height: 1,
    },
    "::before": {
      background: colors.line,
      flex: "1",
      content: '""',
      height: 1,
    },
  },
  googleBtn: {
    background: {
      default: colors.paper,
      ":hover:not(:disabled)": colors.paper3,
    },
    padding: "11px 14px",
    borderColor: {
      default: colors.lineStrong,
      ":hover:not(:disabled)": colors.ink4,
    },
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 10,
    transition: "background 140ms, border-color 140ms",
    alignItems: "center",
    color: colors.ink,
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    display: "flex",
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: 500,
    justifyContent: "center",
    opacity: {
      default: 1,
      ":disabled": 0.55,
    },
    width: "100%",
  },
  signupLine: {
    margin: 0,
    color: colors.ink3,
    fontSize: 13,
    textAlign: "center",
  },
  foot: {
    gap: 14,
    color: colors.ink4,
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11.5,
    justifyContent: "center",
    letterSpacing: "0.02em",
  },
  footSep: { color: colors.ink5 },
});
