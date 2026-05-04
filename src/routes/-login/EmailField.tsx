import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";

import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { ErrorIcon } from "./icons";

interface EmailFieldPropsT {
  id: string;
  name: string;
  value: string;
  error: string | null;
  disabled: boolean;
  onInput: (v: string) => void;
  onBlur: () => void;
}

export function EmailField(props: Readonly<EmailFieldPropsT>) {
  return (
    <div {...sx(s.field)}>
      <div {...sx(s.fieldRow)}>
        <label {...sx(s.fieldLabel)} for={props.id}>
          Email
        </label>
      </div>
      <div {...sx(s.inputWrap)}>
        <input
          id={props.id}
          name={props.name}
          {...sx(s.input, !!props.error && s.inputInvalid)}
          type="email"
          placeholder="marie@exporter.fr"
          autocomplete="email"
          required
          value={props.value}
          onInput={(e) => { props.onInput(e.currentTarget.value); }}
          onBlur={() => { props.onBlur(); }}
          disabled={props.disabled}
        />
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
  inputInvalid: {
    borderColor: colors.err,
    outlineColor: colors.errSoft,
    outlineWidth: 3,
  },
  fieldError: {
    gap: 4,
    alignItems: "center",
    color: colors.err,
    display: "flex",
    fontSize: 12,
  },
});
