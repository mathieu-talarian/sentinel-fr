import type { ToolCallT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";

import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { Icon } from "../Icons";

import { ResultCard } from "./ResultCard";

interface InspectorPropsT {
  open: boolean;
  calls: ToolCallT[];
  focusedCallId: string | null;
  onFocusCall: (id: string) => void;
  onClose: () => void;
}

const isComplete = (c: ToolCallT) =>
  c.status === "complete" && c.result != null;

export function Inspector(props: Readonly<InspectorPropsT>) {
  const completed = () => props.calls.filter((c) => isComplete(c));

  return (
    <aside {...sx(s.aside)} aria-hidden={!props.open}>
      <div {...sx(s.head)}>
        <span {...sx(s.title)}>
          <Icon.Side /> Inspector
          <span {...sx(s.titleTag)}>tool results</span>
        </span>
        <button
          type="button"
          {...sx(s.close)}
          onClick={() => { props.onClose(); }}
          title="Collapse"
        >
          <Icon.X />
        </button>
      </div>
      <div {...sx(s.body)}>
        <Show
          when={completed().length > 0}
          fallback={
            <div {...sx(s.empty)}>
              <Icon.Sparkle />
              <div>
                When the agent calls a tool, structured results appear here.
                <div {...sx(s.emptySub)}>
                  catalog · code details · landed cost · CROSS rulings
                </div>
              </div>
            </div>
          }
        >
          <For each={completed()}>
            {(call) => (
              <div onClick={() => { props.onFocusCall(call.id); }}>
                <ResultCard
                  call={call}
                  highlight={call.id === props.focusedCallId}
                />
              </div>
            )}
          </For>
        </Show>
      </div>
    </aside>
  );
}

const s = stylex.create({
  aside: {
    background: colors.paper2,
    overflow: "hidden",
    transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    opacity: {
      default: 1,
      ':is([aria-hidden="true"])': 0,
    },
    borderLeftColor: colors.line,
    borderLeftStyle: borders.solid,
    borderLeftWidth: {
      default: borders.thin,
      ':is([aria-hidden="true"])': "0",
    },
    width: {
      default: 380,
      ':is([aria-hidden="true"])': 0,
    },
  },
  head: {
    padding: "0 16px",
    gap: 10,
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
    height: 48,
  },
  title: {
    gap: 8,
    alignItems: "center",
    color: colors.ink,
    display: "flex",
    fontSize: 13,
    fontWeight: 500,
  },
  titleTag: {
    background: colors.goldSoft,
    padding: "2px 6px",
    borderRadius: 3,
    color: colors.goldDeep,
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  close: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    color: {
      default: colors.ink3,
      ":hover": colors.ink,
    },
    display: "grid",
    height: 26,
    marginLeft: "auto",
    width: 26,
  },
  body: {
    padding: 16,
    flex: "1",
    gap: 14,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  empty: {
    padding: "60px 20px",
    gap: 12,
    alignItems: "center",
    color: colors.ink4,
    display: "flex",
    flexDirection: "column",
    fontSize: 13,
    textAlign: "center",
  },
  emptySub: {
    color: colors.ink5,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 6,
  },
});
