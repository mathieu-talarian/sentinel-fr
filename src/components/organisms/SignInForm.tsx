import type { SessionT } from "@/lib/api/auth";

import * as stylex from "@stylexjs/stylex";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Spinner } from "@/components/atoms/Spinner";
import { CheckIcon } from "@/components/atoms/icons/CheckIcon";
import { CheckboxRow } from "@/components/molecules/CheckboxRow";
import { EmailField } from "@/components/molecules/EmailField";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import { PasswordField } from "@/components/molecules/PasswordField";
import { SignInSchema, signIn } from "@/lib/api/auth";
import { ME_QUERY_KEY } from "@/lib/api/queries";
import { sx } from "@/lib/styles/sx";

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
  next?: string;
}

export function SignInForm(props: Readonly<SignInFormPropsT>) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: (session: SessionT) => {
      queryClient.setQueryData<SessionT | null>(ME_QUERY_KEY, session);
      setSuccess(true);
      // Brief dwell on the success state before navigating, matching the
      // design's "Welcome back → redirect" transition. Only honour `next`
      // if it points back into the app — otherwise default to `/`.
      const target =
        props.next &&
        props.next.startsWith("/") &&
        !props.next.startsWith("/login")
          ? props.next
          : "/";
      setTimeout(() => void navigate({ to: target }), 700);
    },
  });

  const form = useForm({
    defaultValues: { email: "", password: "", rememberMe: false },
    onSubmit: async ({ value }) => {
      await signInMutation.mutateAsync({
        email: value.email,
        password: value.password,
        rememberMe: value.rememberMe,
      });
    },
  });

  const submitting = signInMutation.isPending || props.busy;
  const submitDisabled = submitting || success || signInMutation.isPending;

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
            id={field.name}
            name={field.name}
            value={field.state.value}
            error={fieldErrorMessage(field.state.meta.errors)}
            disabled={submitting}
            onInput={(v) => {
              field.handleChange(v);
            }}
            onBlur={() => {
              field.handleBlur();
            }}
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
            id={field.name}
            name={field.name}
            value={field.state.value}
            error={fieldErrorMessage(field.state.meta.errors)}
            disabled={submitting}
            onInput={(v) => {
              field.handleChange(v);
            }}
            onBlur={() => {
              field.handleBlur();
            }}
          />
        )}
      </form.Field>

      <form.Field name="rememberMe">
        {(field) => (
          <CheckboxRow
            label="Keep me signed in for 30 days"
            checked={field.state.value}
            disabled={submitting}
            onChange={(v) => {
              field.handleChange(v);
            }}
          />
        )}
      </form.Field>

      {signInMutation.error && (
        <ErrorBanner message={signInMutation.error.message} />
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={submitDisabled}
      >
        {signInMutation.isPending && (
          <>
            <Spinner tone="paper" />
            <span>Signing in…</span>
          </>
        )}
        {success && (
          <>
            <CheckIcon />
            <span>Welcome back</span>
          </>
        )}
        {!signInMutation.isPending && !success && <span>Sign in</span>}
      </Button>
    </form>
  );
}

const s = stylex.create({
  fields: { gap: 14, display: "flex", flexDirection: "column" },
});
