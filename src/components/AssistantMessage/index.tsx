import type { AssistantMessageDataT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";

import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { Icon } from "../Icons";

import { Reply } from "./Reply";
import { ThinkingPanel } from "./ThinkingPanel";
import { ToolPill } from "./ToolPill";

interface AssistantMessagePropsT {
  msg: AssistantMessageDataT;
  focusedCallId: string | null;
  onFocusCall: (id: string) => void;
  autoCollapseThinking: boolean;
  defaultThinkingOpen: boolean;
}

const ACTION_BUTTONS = [
  { title: "Copy", Glyph: Icon.Copy },
  { title: "Regenerate", Glyph: Icon.Refresh },
  { title: "Good", Glyph: Icon.ThumbUp },
  { title: "Bad", Glyph: Icon.ThumbDown },
] as const;

export function AssistantMessage(props: Readonly<AssistantMessagePropsT>) {
  const showThinking = () => !!props.msg.thinking || props.msg.thinkingActive;
  const showActions = () => props.msg.done && !props.msg.streaming;

  return (
    <div {...sx(s.row)}>
      <div {...sx(s.icon)}>S</div>
      <div {...sx(s.body)}>
        <Show when={showThinking()}>
          <ThinkingPanel
            text={props.msg.thinking}
            active={props.msg.thinkingActive}
            ms={props.msg.thinkingMs}
            autoCollapse={props.autoCollapseThinking}
            defaultOpen={
              props.defaultThinkingOpen || props.msg.thinkingActive
            }
          />
        </Show>

        <Show when={props.msg.calls.length > 0}>
          <div {...sx(s.pills)}>
            <For each={props.msg.calls}>
              {(call) => (
                <ToolPill
                  call={call}
                  active={call.id === props.focusedCallId}
                  onClick={() => { props.onFocusCall(call.id); }}
                />
              )}
            </For>
          </div>
        </Show>

        <Show when={props.msg.reply}>
          <Reply text={props.msg.reply} streaming={props.msg.streaming} />
        </Show>

        <Show when={props.msg.error}>
          {(err) => <div {...sx(s.error)}>Stream error: {err()}</div>}
        </Show>

        <Show when={props.msg.caveats?.length}>
          <div {...sx(s.caveats)}>
            <div {...sx(s.caveatsLabel)}>Caveats</div>
            <ul {...sx(s.caveatsList)}>
              <For each={props.msg.caveats}>
                {(c) => <li {...sx(s.caveatsItem)}>{c}</li>}
              </For>
            </ul>
          </div>
        </Show>

        <Show when={showActions()}>
          <div {...sx(s.actions)}>
            <For each={ACTION_BUTTONS}>
              {(btn) => (
                <button type="button" {...sx(s.actionBtn)} title={btn.title}>
                  <btn.Glyph />
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}

const s = stylex.create({
  row: {
    gap: 12,
    alignItems: "flex-start",
    display: "flex",
  },
  icon: {
    background: colors.ink,
    borderRadius: 6,
    placeItems: "center",
    color: colors.paper,
    display: "grid",
    flexShrink: 0,
    fontFamily: fonts.serif,
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: 600,
    height: 26,
    marginTop: 2,
    width: 26,
  },
  body: {
    flex: "1",
    gap: 10,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  pills: {
    gap: 6,
    display: "flex",
    flexWrap: "wrap",
  },
  error: {
    background: colors.errSoft,
    padding: "8px 12px",
    borderColor: colors.err,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  caveats: {
    background: colors.paper2,
    padding: "8px 12px",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: radii.sm,
    borderLeftColor: colors.lineStrong,
    borderLeftStyle: borders.solid,
    borderLeftWidth: borders.bold,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radii.sm,
    marginTop: 4,
  },
  caveatsLabel: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  caveatsList: { margin: 0, paddingLeft: 18 },
  caveatsItem: {
    margin: "2px 0",
    color: colors.ink3,
    fontSize: 12.5,
    fontStyle: "italic",
  },
  actions: {
    gap: 2,
    display: "flex",
    marginTop: 2,
  },
  actionBtn: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    borderColor: {
      default: "transparent",
      ":hover": colors.line,
    },
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    placeItems: "center",
    color: {
      default: colors.ink4,
      ":hover": colors.ink2,
    },
    display: "grid",
    height: 26,
    width: 26,
  },
});
