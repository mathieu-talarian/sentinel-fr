import { Show, createSignal } from 'solid-js'
import {
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/solid-router'
import * as stylex from '@stylexjs/stylex'
import { createForm } from '@tanstack/solid-form'
import { useMutation, useQueryClient } from '@tanstack/solid-query'

import { sx } from '~/lib/sx'
import { signIn, signInWithGoogle, SignInSchema } from '~/lib/auth'
import type { Session } from '~/lib/auth'
import { ME_QUERY_KEY, meQueryOptions } from '~/lib/queries'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(meQueryOptions())
    if (session) throw redirect({ to: '/' })
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = createSignal(false)
  const [googleSubmitting, setGoogleSubmitting] = createSignal(false)
  const [success, setSuccess] = createSignal(false)

  const signInMutation = useMutation(() => ({
    mutationFn: signIn,
    onSuccess: (session: Session) => {
      queryClient.setQueryData<Session | null>(ME_QUERY_KEY, session)
      setSuccess(true)
      // Brief dwell on the success state before navigating, matching the
      // design's "Welcome back → redirect" transition.
      setTimeout(() => void navigate({ to: '/' }), 700)
    },
  }))

  const form = createForm(() => ({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      await signInMutation.mutateAsync({
        email: value.email,
        password: value.password,
        rememberMe: value.rememberMe,
      })
    },
  }))

  const handleGoogle = () => {
    setGoogleSubmitting(true)
    signInWithGoogle()
  }

  const submitting = () => signInMutation.isPending || googleSubmitting()
  const submitDisabled = () =>
    submitting() || success() || signInMutation.isPending

  const fieldErrorMessage = (errors: ReadonlyArray<unknown>): string | null => {
    if (errors.length === 0) return null
    const first = errors[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object' && 'message' in first) {
      const msg = first.message
      if (typeof msg === 'string') return msg
    }
    return null
  }

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
          disabled={submitting()}
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
            <span {...sx(s.spinnerInk)} />
            <span>Connecting to Google…</span>
          </Show>
        </button>

        <div {...sx(s.divider)} aria-hidden="true">
          or
        </div>

        <form
          {...sx(s.fields)}
          onSubmit={(e) => {
            e.preventDefault()
            void form.handleSubmit()
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
            {(field) => {
              const err = () => fieldErrorMessage(field().state.meta.errors)
              return (
                <div {...sx(s.field)}>
                  <div {...sx(s.fieldRow)}>
                    <label {...sx(s.fieldLabel)} for={field().name}>
                      Email
                    </label>
                  </div>
                  <div {...sx(s.inputWrap)}>
                    <input
                      id={field().name}
                      name={field().name}
                      {...sx(s.input, !!err() && s.inputInvalid)}
                      type="email"
                      placeholder="marie@exporter.fr"
                      autocomplete="email"
                      required
                      value={field().state.value}
                      onInput={(e) =>
                        field().handleChange(e.currentTarget.value)
                      }
                      onBlur={() => field().handleBlur()}
                      disabled={submitting()}
                    />
                  </div>
                  <Show when={err()}>
                    {(msg) => (
                      <div {...sx(s.fieldError)}>
                        <ErrorIcon />
                        <span>{msg()}</span>
                      </div>
                    )}
                  </Show>
                </div>
              )
            }}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onBlur: SignInSchema.shape.password,
              onSubmit: SignInSchema.shape.password,
            }}
          >
            {(field) => {
              const err = () => fieldErrorMessage(field().state.meta.errors)
              return (
                <div {...sx(s.field)}>
                  <div {...sx(s.fieldRow)}>
                    <label {...sx(s.fieldLabel)} for={field().name}>
                      Password
                    </label>
                    <a
                      {...sx(s.fieldLink)}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                    >
                      Forgot?
                    </a>
                  </div>
                  <div {...sx(s.inputWrap)}>
                    <input
                      id={field().name}
                      name={field().name}
                      {...sx(s.input, s.inputWithToggle, !!err() && s.inputInvalid)}
                      type={showPassword() ? 'text' : 'password'}
                      placeholder="••••••••••"
                      autocomplete="current-password"
                      required
                      value={field().state.value}
                      onInput={(e) =>
                        field().handleChange(e.currentTarget.value)
                      }
                      onBlur={() => field().handleBlur()}
                      disabled={submitting()}
                    />
                    <button
                      type="button"
                      {...sx(s.inputToggle)}
                      onClick={() => setShowPassword(!showPassword())}
                      aria-label={
                        showPassword() ? 'Hide password' : 'Show password'
                      }
                      tabIndex={-1}
                    >
                      <Show when={showPassword()} fallback={<EyeIcon />}>
                        <EyeOffIcon />
                      </Show>
                    </button>
                  </div>
                  <Show when={err()}>
                    {(msg) => (
                      <div {...sx(s.fieldError)}>
                        <ErrorIcon />
                        <span>{msg()}</span>
                      </div>
                    )}
                  </Show>
                </div>
              )
            }}
          </form.Field>

          <form.Field name="rememberMe">
            {(field) => (
              <label {...sx(s.checkboxRow)}>
                <input
                  type="checkbox"
                  {...sx(s.checkbox)}
                  checked={field().state.value}
                  onChange={(e) =>
                    field().handleChange(e.currentTarget.checked)
                  }
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
              <span {...sx(s.spinnerPaper)} />
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

        <p {...sx(s.signupLine)}>
          New to Sentinel?{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>
            Request access
          </a>
        </p>
      </div>

      <div {...sx(s.foot)}>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Privacy
        </a>
        <span {...sx(s.footSep)}>·</span>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Terms
        </a>
        <span {...sx(s.footSep)}>·</span>
        <a href="#" onClick={(e) => e.preventDefault()}>
          Status
        </a>
      </div>
    </div>
  )
}

/* ---------- icons (login-only) ---------- */

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.32z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M2 2l12 12" />
      <path d="M6.5 6.5a2 2 0 0 0 2.83 2.83" />
      <path d="M3.6 5.4C2.4 6.5 1.5 8 1.5 8s2.5 4.5 6.5 4.5c1 0 1.9-.2 2.7-.55" />
      <path d="M8 3.5c4 0 6.5 4.5 6.5 4.5s-.55 1-1.55 2.05" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="4.5" />
      <path d="M6 4v2.5M6 8h0" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m3 7 3 3 5-6" />
    </svg>
  )
}

const s = stylex.create({
  shell: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    padding: '32px 20px',
    background: 'var(--paper-2)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    fontFamily: 'var(--serif)',
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: 'var(--ink)',
  },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: 'var(--ink)',
    color: 'var(--paper)',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'var(--serif)',
    fontStyle: 'italic',
    fontWeight: 600,
    fontSize: 15,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px 28px',
    boxShadow: 'var(--shadow)',
    display: 'flex',
    flexDirection: 'column',
    gap: 22,
  },
  head: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  title: {
    fontFamily: 'var(--serif)',
    fontSize: 26,
    fontWeight: 400,
    letterSpacing: '-0.015em',
    lineHeight: 1.2,
    color: 'var(--ink)',
    margin: 0,
  },
  titleEm: { fontStyle: 'italic', color: 'var(--gold-deep)' },
  sub: { fontSize: 13, color: 'var(--ink-3)', margin: 0 },
  fields: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  fieldRow: { display: 'flex', alignItems: 'baseline' },
  fieldLabel: { fontSize: 12, fontWeight: 500, color: 'var(--ink-2)' },
  fieldLink: {
    marginLeft: 'auto',
    fontSize: 12,
    color: 'var(--gold-deep)',
    textDecoration: 'none',
    cursor: 'pointer',
    ':hover': { textDecoration: 'underline' },
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--line-strong)',
    borderRadius: 'var(--radius)',
    background: 'var(--paper)',
    fontFamily: 'var(--sans)',
    fontSize: 14,
    color: 'var(--ink)',
    transition: 'border-color 140ms, box-shadow 140ms',
    outline: 'none',
    ':focus': {
      borderColor: 'var(--ink-3)',
      boxShadow: '0 0 0 3px var(--gold-soft)',
    },
    '::placeholder': { color: 'var(--ink-4)' },
  },
  inputWithToggle: { paddingRight: 40 },
  inputInvalid: {
    borderColor: 'var(--err)',
    boxShadow: '0 0 0 3px var(--err-soft)',
  },
  inputToggle: {
    position: 'absolute',
    right: 8,
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    border: 0,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--ink-4)',
    cursor: 'pointer',
    ':hover': { color: 'var(--ink-2)', background: 'var(--paper-3)' },
  },
  fieldError: {
    fontSize: 12,
    color: 'var(--err)',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  formError: {
    fontSize: 12,
    color: 'var(--err)',
    background: 'var(--err-soft)',
    border: '1px solid var(--err)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--ink-2)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: 15,
    height: 15,
    accentColor: 'var(--ink)',
    cursor: 'pointer',
  },
  primaryBtn: {
    width: '100%',
    padding: '11px 14px',
    border: 0,
    borderRadius: 'var(--radius)',
    background: 'var(--ink)',
    color: 'var(--paper)',
    fontFamily: 'var(--sans)',
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'background 140ms',
    cursor: 'pointer',
    ':hover:not(:disabled)': { background: 'var(--ink-2)' },
    ':disabled': { opacity: 0.55, cursor: 'not-allowed' },
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontFamily: 'var(--mono)',
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-4)',
    '::before': {
      content: '""',
      flex: 1,
      height: 1,
      background: 'var(--line)',
    },
    '::after': {
      content: '""',
      flex: 1,
      height: 1,
      background: 'var(--line)',
    },
  },
  googleBtn: {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid var(--line-strong)',
    borderRadius: 'var(--radius)',
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontFamily: 'var(--sans)',
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'background 140ms, border-color 140ms',
    cursor: 'pointer',
    ':hover:not(:disabled)': {
      background: 'var(--paper-3)',
      borderColor: 'var(--ink-4)',
    },
    ':disabled': { opacity: 0.55, cursor: 'not-allowed' },
  },
  signupLine: {
    fontSize: 13,
    color: 'var(--ink-3)',
    textAlign: 'center',
    margin: 0,
  },
  foot: {
    display: 'flex',
    gap: 14,
    justifyContent: 'center',
    fontSize: 11.5,
    color: 'var(--ink-4)',
    fontFamily: 'var(--mono)',
    letterSpacing: '0.02em',
  },
  footSep: { color: 'var(--ink-5)' },
  spinnerPaper: {
    width: 14,
    height: 14,
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderColor: 'var(--paper)',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animationName: 'spin',
    animationDuration: '0.8s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
  spinnerInk: {
    width: 14,
    height: 14,
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderColor: 'var(--ink)',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animationName: 'spin',
    animationDuration: '0.8s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
})
