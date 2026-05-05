import type { MessageT } from "@/lib/types";
import type { ReactNode, Ref } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";

interface ChatThreadPropsT {
  messages: readonly MessageT[];
  scrollRef?: Ref<HTMLDivElement>;
  renderMessage: (msg: MessageT) => ReactNode;
}

export function ChatThread({
  messages,
  scrollRef,
  renderMessage,
}: Readonly<ChatThreadPropsT>) {
  return (
    <div {...sx(s.thread)} ref={scrollRef}>
      <div {...sx(s.inner)}>
        {messages.map((msg) => (
          <div key={msg.id}>{renderMessage(msg)}</div>
        ))}
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
