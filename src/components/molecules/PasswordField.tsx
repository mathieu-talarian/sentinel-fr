import * as stylex from "@stylexjs/stylex";
import { Show, createSignal } from "solid-js";

import { FieldError } from "~/components/atoms/FieldError";
import { FieldLabel } from "~/components/atoms/FieldLabel";
import { IconButton } from "~/components/atoms/IconButton";
import { Input } from "~/components/atoms/Input";
import { TextLink } from "~/components/atoms/TextLink";
import { EyeIcon } from "~/components/atoms/icons/EyeIcon";
import { EyeOffIcon } from "~/components/atoms/icons/EyeOffIcon";
import { sx } from "~/lib/styles/sx";

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
      <div {...sx(s.row)}>
        <FieldLabel for={props.id}>Password</FieldLabel>
        <span {...sx(s.linkSlot)}>
          <TextLink tone="accent">Forgot?</TextLink>
        </span>
      </div>
      <div {...sx(s.inputWrap)}>
        <Input
          id={props.id}
          name={props.name}
          type={shown() ? "text" : "password"}
          placeholder="••••••••••"
          autocomplete="current-password"
          required
          value={props.value}
          state={props.error ? "error" : "default"}
          disabled={props.disabled}
          paddedRight
          onValueChange={props.onInput}
          onBlur={() => {
            props.onBlur();
          }}
        />
        <span {...sx(s.toggleSlot)}>
          <IconButton
            variant="ghost-subtle"
            size="md"
            aria-label={shown() ? "Hide password" : "Show password"}
            tabIndex={-1}
            onClick={() => setShown(!shown())}
          >
            <Show when={shown()} fallback={<EyeIcon />}>
              <EyeOffIcon />
            </Show>
          </IconButton>
        </span>
      </div>
      <Show when={props.error}>{(msg) => <FieldError message={msg()} />}</Show>
    </div>
  );
}

const s = stylex.create({
  field: { gap: 6, display: "flex", flexDirection: "column" },
  row: { alignItems: "baseline", display: "flex" },
  linkSlot: { fontSize: 12, marginLeft: "auto" },
  inputWrap: {
    alignItems: "center",
    display: "flex",
    position: "relative",
  },
  toggleSlot: {
    position: "absolute",
    right: 8,
  },
});
