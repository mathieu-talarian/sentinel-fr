import type { ImportCaseT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";
import { useRef, useState } from "react";

import { UserBubble } from "@/components/molecules/UserBubble";
import { AssistantMessage } from "@/components/organisms/AssistantMessage";
import { CasePatchTray } from "@/components/organisms/CasePatchTray";
import { ChatThread } from "@/components/organisms/ChatThread";
import { Composer } from "@/components/organisms/Composer";
import { useChatStore } from "@/lib/state/chatStore";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface CaseChatSurfacePropsT {
  case_: ImportCaseT;
  isReadOnly: boolean;
}

/**
 * Case-aware chat in the workbench center column. Thread is scoped to
 * the case id so each case keeps its own conversation across tab
 * switches. The `CasePatchTray` sits between the thread and the
 * composer so any `casePatchSuggestion` chunks the assistant emits
 * surface as reviewable rows the user has to accept explicitly.
 */
export function CaseChatSurface(props: Readonly<CaseChatSurfacePropsT>) {
  const { case_, isReadOnly } = props;
  const [tweaks] = useTweaks();
  const chat = useChatStore(case_.id);
  const [input, setInput] = useState("");
  const threadRef = useRef<HTMLDivElement | null>(null);

  const isEmpty = chat.messages.length === 0;

  const send = (text: string) => {
    chat.send({ text });
    queueMicrotask(() => {
      const el = threadRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  return (
    <>
      {isEmpty ? (
        <section {...sx(s.empty)}>
          <h2 {...sx(s.emptyTitle)}>Ask the assistant about this case</h2>
          <p {...sx(s.emptyText)}>
            The assistant reads {case_.title}&apos;s facts, line items, and
            latest quote directly — it won&apos;t re-ask for shipment details it
            can see. It may propose case updates as reviewable chips above the
            composer.
          </p>
        </section>
      ) : (
        <ChatThread
          messages={chat.messages}
          scrollRef={threadRef}
          renderMessage={(msg) =>
            msg.role === "user" ? (
              <UserBubble text={msg.text} />
            ) : (
              <AssistantMessage
                msg={msg}
                focusedCallId={chat.focusedCallId}
                onFocusCall={(id) => {
                  chat.setFocusedCall(id);
                  chat.setInspectorOpen(true);
                }}
                autoCollapseThinking={!tweaks.showThinkingByDefault}
                defaultThinkingOpen={tweaks.showThinkingByDefault}
              />
            )
          }
        />
      )}

      <CasePatchTray case_={case_} isReadOnly={isReadOnly} />

      <Composer
        value={input}
        setValue={setInput}
        onSend={send}
        onStop={() => {
          chat.abort();
        }}
        running={chat.running}
      />
    </>
  );
}

const s = stylex.create({
  empty: {
    margin: "auto 0",
    padding: "20px 16px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: borders.thin,
    gap: 8,
    backgroundColor: colors.paper2,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  emptyTitle: {
    margin: 0,
    color: colors.ink2,
    fontFamily: fonts.serif,
    fontSize: 15,
    fontWeight: 500,
  },
  emptyText: {
    margin: 0,
    color: colors.ink3,
    fontSize: 13,
    lineHeight: 1.5,
  },
});
