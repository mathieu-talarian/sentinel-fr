import * as stylex from "@stylexjs/stylex";
import { Show, createSignal } from "solid-js";

import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { ErrorIcon, EyeIcon, EyeOffIcon } from "./icons";

interface PasswordFieldPropsT {
  id: string;
  name: string;
  value: string;
  error: string | null;
  disabled: boolean;
  onInput: (v: string) => void;
  onBlur: () => void;
}

export function PasswordField(props: Readonly<PasswordFieldPropsT>) {
  const [shown, setShown] = createSignal(false);

  return (
    <div {...sx(s.field)}>
      <div {...sx(s.fieldRow)}>
        <label {...sx(s.fieldLabel)} for={props.id}>
          Password
        </label>
        <a
          {...sx(s.fieldLink)}
          href="#"
          onClick={(e) => { e.preventDefault(); }}
        >
          Forgot?
        </a>
      </div>
      <div {...sx(s.inputWrap)}>
        <input
          id={props.id}
          name={props.name}
          {...sx(s.input, s.inputWithToggle, !!props.error && s.inputInvalid)}
          type={shown() ? "text" : "password"}
          placeholder="••••••••••"
          autocomplete="current-password"
          required
          value={props.value}
          onInput={(e) => { props.onInput(e.currentTarget.value); }}
          onBlur={() => { props.onBlur(); }}
          disabled={props.disabled}
        />
        <button
          type="button"
          {...sx(s.inputToggle)}
          onClick={() => setShown(!shown())}
          aria-label={shown() ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          <Show when={shown()} fallback={<EyeIcon />}>
            <EyeOffIcon />
          </Show>
        </button>
      </div>
      <Show when={props.error}>
        {(msg) => (
          <div {...sx(s.fieldError)}>
            <ErrorIcon />
            <span>{msg()}</span>
          </div>
        )}
      </Show>
    </div>
  );
}

const s = stylex.create({
  field: { gap: 6, display: "flex", flexDirection: "column" },
  fieldRow: { alignItems: "baseline", display: "flex" },
  fieldLabel: { color: colors.ink2, fontSize: 12, fontWeight: 500 },
  fieldLink: {
    textDecoration: {
      default: "none",
      ":hover": "underline",
    },
    color: colors.goldDeep,
    cursor: "pointer",
    fontSize: 12,
    marginLeft: "auto",
  },
  inputWrap: {
    alignItems: "center",
    display: "flex",
    position: "relative",
  },
  input: {
    background: colors.paper,
    padding: "10px 12px",
    borderColor: {
      default: colors.lineStrong,
      ":focus": colors.ink3,
    },
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    transition: "border-color 140ms, outline-width 140ms",
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    outlineColor: colors.goldSoft,
    outlineOffset: 0,
    outlineStyle: borders.solid,
    outlineWidth: {
      default: 0,
      ":focus": 3,
    },
    width: "100%",
    "::placeholder": { color: colors.ink4 },
  },
  inputWithToggle: { paddingRight: 40 },
  inputInvalid: {
    borderColor: colors.err,
    outlineColor: colors.errSoft,
    outlineWidth: 3,
  },
  inputToggle: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    color: {
      default: colors.ink4,
      ":hover": colors.ink2,
    },
    cursor: "pointer",
    display: "grid",
    position: "absolute",
    height: 28,
    right: 8,
    width: 28,
  },
  fieldError: {
    gap: 4,
    alignItems: "center",
    color: colors.err,
    display: "flex",
    fontSize: 12,
  },
});
