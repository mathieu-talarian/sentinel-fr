import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";

import { FieldError } from "~/components/atoms/FieldError";
import { FieldLabel } from "~/components/atoms/FieldLabel";
import { Input } from "~/components/atoms/Input";
import { sx } from "~/lib/styles/sx";

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
      <FieldLabel for={props.id}>Email</FieldLabel>
      <Input
        id={props.id}
        name={props.name}
        type="email"
        placeholder="marie@exporter.fr"
        autocomplete="email"
        required
        value={props.value}
        state={props.error ? "error" : "default"}
        disabled={props.disabled}
        onValueChange={props.onInput}
        onBlur={() => {
          props.onBlur();
        }}
      />
      <Show when={props.error}>{(msg) => <FieldError message={msg()} />}</Show>
    </div>
  );
}

const s = stylex.create({
  field: { gap: 6, display: "flex", flexDirection: "column" },
});
