import type { SessionT } from "~/lib/auth";

import * as stylex from "@stylexjs/stylex";
import { createForm } from "@tanstack/solid-form";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@tanstack/solid-router";
import { Show, createSignal } from "solid-js";

import { SignInSchema, signIn } from "~/lib/auth";
import { ME_QUERY_KEY } from "~/lib/queries";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { EmailField } from "./EmailField";
import { PasswordField } from "./PasswordField";
import { Spinner } from "./Spinner";
import { CheckIcon, ErrorIcon } from "./icons";

const fieldErrorMessage = (errors: readonly unknown[]): string | null => {
  if (errors.length === 0) return null;
  const first = errors[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "message" in first) {
    const msg = first.message;
    if (typeof msg === "string") return msg;
  }
  return null;
};

interface SignInFormPropsT {
  busy: boolean;
}

export function SignInForm(props: Readonly<SignInFormPropsT>) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [success, setSuccess] = createSignal(false);

  const signInMutation = useMutation(() => ({
    mutationFn: signIn,
    onSuccess: (session: SessionT) => {
      queryClient.setQueryData<SessionT | null>(ME_QUERY_KEY, session);
      setSuccess(true);
      // Brief dwell on the success state before navigating, matching the
      // design's "Welcome back → redirect" transition.
      setTimeout(() => void navigate({ to: "/" }), 700);
    },
  }));

  const form = createForm(() => ({
    defaultValues: { email: "", password: "", rememberMe: false },
    onSubmit: async ({ value }) => {
      await signInMutation.mutateAsync({
        email: value.email,
        password: value.password,
        rememberMe: value.rememberMe,
      });
    },
  }));

  const submitting = () => signInMutation.isPending || props.busy;
  const submitDisabled = () =>
    submitting() || success() || signInMutation.isPending;

  return (
    <form
      {...sx(s.fields)}
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      noValidate
    >
      <form.Field
        name="email"
        validators={{
          onBlur: SignInSchema.shape.email,
          onSubmit: SignInSchema.shape.email,
        }}
      >
        {(field) => (
          <EmailField
            id={field().name}
            name={field().name}
            value={field().state.value}
            error={fieldErrorMessage(field().state.meta.errors)}
            disabled={submitting()}
            onInput={(v) => { field().handleChange(v); }}
            onBlur={() => { field().handleBlur(); }}
          />
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onBlur: SignInSchema.shape.password,
          onSubmit: SignInSchema.shape.password,
        }}
      >
        {(field) => (
          <PasswordField
            id={field().name}
            name={field().name}
            value={field().state.value}
            error={fieldErrorMessage(field().state.meta.errors)}
            disabled={submitting()}
            onInput={(v) => { field().handleChange(v); }}
            onBlur={() => { field().handleBlur(); }}
          />
        )}
      </form.Field>

      <form.Field name="rememberMe">
        {(field) => (
          <label {...sx(s.checkboxRow)}>
            <input
              type="checkbox"
              {...sx(s.checkbox)}
              checked={field().state.value}
              onChange={(e) => { field().handleChange(e.currentTarget.checked); }}
              disabled={submitting()}
            />
            <span>Keep me signed in for 30 days</span>
          </label>
        )}
      </form.Field>

      <Show when={signInMutation.error}>
        {(err) => (
          <div {...sx(s.formError)}>
            <ErrorIcon />
            <span>{err().message}</span>
          </div>
        )}
      </Show>

      <button
        type="submit"
        {...sx(s.primaryBtn)}
        disabled={submitDisabled()}
      >
        <Show when={signInMutation.isPending}>
          <Spinner tone="paper" />
          <span>Signing in…</span>
        </Show>
        <Show when={success()}>
          <CheckIcon />
          <span>Welcome back</span>
        </Show>
        <Show when={!signInMutation.isPending && !success()}>
          <span>Sign in</span>
        </Show>
      </button>
    </form>
  );
}

const s = stylex.create({
  fields: { gap: 14, display: "flex", flexDirection: "column" },
  checkboxRow: {
    gap: 8,
    alignItems: "center",
    color: colors.ink2,
    cursor: "pointer",
    display: "flex",
    fontSize: 13,
    userSelect: "none",
  },
  checkbox: {
    accentColor: colors.ink,
    cursor: "pointer",
    height: 15,
    width: 15,
  },
  formError: {
    background: colors.errSoft,
    padding: "7px 10px",
    borderColor: colors.err,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    alignItems: "center",
    color: colors.err,
    display: "flex",
    fontSize: 12,
  },
  primaryBtn: {
    background: {
      default: colors.ink,
      ":hover:not(:disabled)": colors.ink2,
    },
    padding: "11px 14px",
    borderRadius: radii.md,
    borderStyle: "none",
    borderWidth: 0,
    gap: 8,
    transition: "background 140ms",
    alignItems: "center",
    color: colors.paper,
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
});
