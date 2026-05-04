import * as stylex from "@stylexjs/stylex";
import { Show, createEffect, createSignal, on } from "solid-js";

import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii, shadows } from "~/lib/tokens.stylex";

import { Icon } from "./Icons";

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
        <textarea
          ref={setTa}
          {...sx(s.textarea)}
          value={props.value}
          onInput={(e) => {
            props.setValue(e.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Describe your product, ask for a landed cost, or set up a tariff alert…"
          rows={1}
        />
        <div {...sx(s.foot)}>
          <button type="button" {...sx(s.tool)} title="Attach">
            <Icon.Paperclip />
          </button>
          <button type="button" {...sx(s.tool)} title="Tools">
            <Icon.Hash />
          </button>
          <span {...sx(s.hint)}>
            Enter to send · Shift+Enter newline · Esc to stop
          </span>
          <Show
            when={props.running}
            fallback={
              <button
                type="button"
                {...sx(s.send)}
                disabled={!props.value.trim()}
                onClick={submit}
                title="Send"
              >
                <Icon.Send />
              </button>
            }
          >
            <button
              type="button"
              {...sx(s.send, s.sendStop)}
              onClick={() => { props.onStop(); }}
              title="Stop"
            >
              <Icon.Stop />
            </button>
          </Show>
        </div>
      </div>
      <div {...sx(s.disclaimer)}>
        Sentinel surfaces best-effort classifications
        <span {...sx(s.dot)}>·</span>
        Always confirm with your customs broker before entry
        <span {...sx(s.dot)}>·</span>
        Section 301/232 not modelled
      </div>
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
  textarea: {
    background: "transparent",
    padding: "12px 14px 4px",
    borderStyle: "none",
    borderWidth: 0,
    outline: "none",
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 1.55,
    resize: "none",
    maxHeight: 160,
    minHeight: 28,
    width: "100%",
    "::placeholder": { color: colors.ink4 },
  },
  foot: {
    padding: "4px 8px 8px",
    gap: 6,
    alignItems: "center",
    display: "flex",
  },
  tool: {
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
    display: "grid",
    height: 30,
    width: 30,
  },
  hint: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.02em",
    marginLeft: "auto",
  },
  send: {
    background: colors.ink,
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    transition: "opacity 140ms",
    color: colors.paper,
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    display: "grid",
    opacity: {
      default: 1,
      ":disabled": 0.3,
    },
    height: 30,
    width: 30,
  },
  sendStop: { background: colors.err },
  disclaimer: {
    margin: "8px auto 0",
    color: colors.ink4,
    fontSize: 11,
    textAlign: "center",
    maxWidth: 760,
  },
  dot: { margin: "0 6px", color: colors.ink5 },
});
