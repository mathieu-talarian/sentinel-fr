import * as stylex from "@stylexjs/stylex";
import { createEffect, createSignal, on } from "solid-js";

import { Icon } from "~/components/atoms/Icons";
import { Textarea } from "~/components/atoms/Textarea";
import { ComposerDisclaimer } from "~/components/molecules/ComposerDisclaimer";
import { ComposerSendButton } from "~/components/molecules/ComposerSendButton";
import { ComposerToolButton } from "~/components/molecules/ComposerToolButton";
import { sx } from "~/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  shadows,
} from "~/lib/styles/tokens.stylex";

interface ComposerPropsT {
  value: string;
  setValue: (v: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  running: boolean;
}

const MAX_HEIGHT = 160;

export function Composer(props: Readonly<ComposerPropsT>) {
  const [ta, setTa] = createSignal<HTMLTextAreaElement>();

  // Grow textarea up to MAX_HEIGHT as content arrives.
  createEffect(
    on(
      () => props.value,
      () => {
        const el = ta();
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${String(Math.min(MAX_HEIGHT, el.scrollHeight))}px`;
      },
    ),
  );

  const submit = () => {
    const v = props.value.trim();
    if (!v || props.running) return;
    props.onSend(v);
    props.setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === "Escape" && props.running) {
      e.preventDefault();
      props.onStop();
    }
  };

  return (
    <div {...sx(s.wrap)}>
      <div {...sx(s.shell)}>
        <Textarea
          ref={setTa}
          value={props.value}
          maxHeight={MAX_HEIGHT}
          placeholder="Describe your product, ask for a landed cost, or set up a tariff alert…"
          onValueChange={props.setValue}
          onKeyDown={handleKeyDown}
        />
        <div {...sx(s.foot)}>
          <ComposerToolButton title="Attach">
            <Icon.Paperclip />
          </ComposerToolButton>
          <ComposerToolButton title="Tools">
            <Icon.Hash />
          </ComposerToolButton>
          <span {...sx(s.hint)}>
            Enter to send · Shift+Enter newline · Esc to stop
          </span>
          <ComposerSendButton
            running={props.running}
            canSend={!!props.value.trim()}
            onSend={submit}
            onStop={props.onStop}
          />
        </div>
      </div>
      <ComposerDisclaimer />
    </div>
  );
}

const s = stylex.create({
  wrap: {
    background: colors.paper,
    padding: "12px 28px 18px",
    flexShrink: 0,
  },
  shell: {
    background: colors.paper,
    margin: "0 auto",
    borderColor: {
      default: colors.lineStrong,
      ":focus-within": colors.ink3,
    },
    borderRadius: radii.lg,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    transition: "border-color 140ms, box-shadow 140ms",
    boxShadow: {
      default: shadows.md,
      ":focus-within": shadows.lg,
    },
    maxWidth: 760,
  },
  foot: {
    padding: "4px 8px 8px",
    gap: 6,
    alignItems: "center",
    display: "flex",
  },
  hint: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.02em",
    marginLeft: "auto",
  },
});
