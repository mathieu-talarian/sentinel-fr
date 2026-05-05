import * as stylex from "@stylexjs/stylex";
import { Show, createEffect, createSignal, on } from "solid-js";

import { Icon } from "~/components/atoms/Icons";
import { Pulse } from "~/components/atoms/Pulse";
import { sx } from "~/lib/styles/sx";
import { borders, colors, fonts, radii } from "~/lib/styles/tokens.stylex";

interface ThinkingPanelPropsT {
  text: string;
  active: boolean;
  ms?: number;
  autoCollapse: boolean;
  defaultOpen: boolean;
}

const formatMs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

const tokenCount = (text: string): number | undefined =>
  text ? Math.round(text.length / 3.5) : undefined;

export function ThinkingPanel(props: Readonly<ThinkingPanelPropsT>) {
  const [open, setOpen] = createSignal(props.defaultOpen);
  const [userToggled, setUserToggled] = createSignal(false);
  const [bodyRef, setBodyRef] = createSignal<HTMLDivElement>();

  createEffect(() => {
    if (props.autoCollapse && !props.active && !userToggled()) setOpen(false);
  });

  // Pin scroll to the bottom while reasoning streams in.
  createEffect(
    on(
      () => props.text,
      () => {
        const el = bodyRef();
        if (open() && el && props.active) {
          el.scrollTop = el.scrollHeight;
        }
      },
    ),
  );

  const tokens = () => tokenCount(props.text);

  const handleToggle = () => {
    setOpen((o) => !o);
    setUserToggled(true);
  };

  return (
    <div {...sx(t.root)}>
      <div {...sx(t.head)} onClick={handleToggle}>
        <span {...sx(t.chev, open() && t.chevOpen)}>
          <Icon.Chevron />
        </span>
        <span {...sx(t.label)}>
          <Show when={props.active}>
            <Pulse />
          </Show>
          <span {...sx(t.labelText)}>
            {props.active ? "Thinking…" : "Thought"}
          </span>
        </span>
        <span {...sx(t.stats)}>
          <Show when={props.ms != null}>
            {(_) => <>{formatMs(props.ms ?? 0)}</>}
          </Show>
          <Show when={tokens() != null}>
            {(_) => <> · {tokens()} tokens</>}
          </Show>
        </span>
      </div>
      <Show when={open()}>
        <div ref={setBodyRef} {...sx(t.body)}>
          {props.text}
        </div>
      </Show>
    </div>
  );
}

const t = stylex.create({
  root: {
    background: colors.paper2,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    fontSize: 13,
  },
  head: {
    padding: "8px 12px",
    gap: 10,
    alignItems: "center",
    color: {
      default: colors.ink3,
      ":hover": colors.ink,
    },
    cursor: "pointer",
    display: "flex",
    userSelect: "none",
  },
  chev: {
    transition: "transform 180ms",
    display: "inline-flex",
    flexShrink: 0,
  },
  chevOpen: { transform: "rotate(90deg)" },
  label: { gap: 8, alignItems: "center", display: "flex" },
  labelText: { fontWeight: 500 },
  stats: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.02em",
    marginLeft: "auto",
  },
  body: {
    background: colors.paper,
    padding: "12px 14px",
    color: colors.ink3,
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 1.65,
    whiteSpace: "pre-wrap",
    borderTopColor: colors.line,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thin,
    maxHeight: 280,
    overflowY: "auto",
  },
});
