import type { JSX } from "solid-js";
import type { MessageT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For } from "solid-js";

import { sx } from "~/lib/styles/sx";

interface ChatThreadPropsT {
  messages: readonly MessageT[];
  ref?: (el: HTMLDivElement) => void;
  renderMessage: (msg: MessageT) => JSX.Element;
}

export function ChatThread(props: Readonly<ChatThreadPropsT>) {
  return (
    <div {...sx(s.thread)} ref={props.ref}>
      <div {...sx(s.inner)}>
        <For each={props.messages}>{(msg) => props.renderMessage(msg)}</For>
      </div>
    </div>
  );
}

const s = stylex.create({
  thread: {
    padding: "24px 0 8px",
    flex: "1",
    scrollBehavior: "smooth",
    overflowY: "auto",
  },
  inner: {
    margin: "0 auto",
    padding: "0 28px",
    gap: 28,
    display: "flex",
    flexDirection: "column",
    maxWidth: 760,
  },
});
