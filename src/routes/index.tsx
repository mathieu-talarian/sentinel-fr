import type { SuggestionT } from "~/lib/suggestions";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect } from "@tanstack/solid-router";
import { For, Show, createMemo, createSignal, untrack } from "solid-js";

import { AssistantMessage } from "~/components/AssistantMessage";
import { Composer } from "~/components/Composer";
import { EmptyState } from "~/components/EmptyState";
import { Inspector } from "~/components/Inspector";
import { Rail } from "~/components/Rail";
import { TweaksPanel } from "~/components/TweaksPanel";
import { createChatStore } from "~/lib/chatStore";
import { meQueryOptions } from "~/lib/queries";
import { suggestionTitleFor } from "~/lib/suggestions";
import { sx } from "~/lib/sx";
import { colors } from "~/lib/tokens.stylex";
import { useTweaks } from "~/lib/tweaks";

import { ChatTopbar } from "./-chat/ChatTopbar";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(meQueryOptions());
    if (!session) {
      // `throw: true` makes redirect() throw internally — keeps the signal
      // intact for TanStack Router without a bare `throw` at the call site.
      redirect({ to: "/login", throw: true });
    }
  },
  component: ChatPage,
});

function ChatPage() {
  const [tweaks, setTweaks] = useTweaks();
  const chat = createChatStore({
    autoOpenInspector: () => tweaks().inspectorAutoOpen,
    provider: () => tweaks().provider,
  });
  const [input, setInput] = createSignal("");
  const [tweaksOpen, setTweaksOpen] = createSignal(false);

  const [threadEl, setThreadEl] = createSignal<HTMLDivElement>();

  const isEmpty = () => chat.messages.length === 0;

  const firstUserText = createMemo(() => {
    const u = chat.messages.find((m) => m.role === "user");
    return u?.role === "user" ? u.text : "";
  });

  const headerTitle = createMemo(() => {
    if (isEmpty()) return "New chat";
    return suggestionTitleFor(firstUserText()) ?? "Conversation";
  });

  const allCalls = createMemo(() =>
    chat.messages.flatMap((m) => (m.role === "assistant" ? m.calls : [])),
  );
  const hasAnyResults = () => allCalls().some((c) => c.result != null);

  const send = (text: string) => {
    void chat.send({ text });
    queueMicrotask(() => {
      const el = untrack(threadEl);
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const onPick = (suggestion: SuggestionT) => {
    send(suggestion.text);
  };

  const focusCall = (id: string) => {
    chat.setFocusedCall(id);
    chat.setInspectorOpen(true);
  };

  return (
    <>
      <Rail
        onNewChat={() => { chat.reset(); }}
        onOpenSettings={() => setTweaksOpen(true)}
      />

      <main {...sx(s.center)}>
        <ChatTopbar
          title={headerTitle()}
          provider={tweaks().provider}
          lang={tweaks().lang}
          running={chat.running()}
          inspectorOpen={chat.inspectorOpen()}
          inspectorEnabled={hasAnyResults()}
          onProviderChange={(p) => { setTweaks({ provider: p }); }}
          onLangChange={(l) => { setTweaks({ lang: l }); }}
          onToggleInspector={() =>
            { chat.setInspectorOpen(!chat.inspectorOpen()); }
          }
        />

        <Show when={!isEmpty()} fallback={<EmptyState onPick={onPick} />}>
          <div {...sx(s.thread)} ref={setThreadEl}>
            <div {...sx(s.threadInner)}>
              <For each={chat.messages}>
                {(msg) =>
                  msg.role === "user" ? (
                    <div {...sx(s.userRow)}>
                      <div {...sx(s.userBubble)}>{msg.text}</div>
                    </div>
                  ) : (
                    <AssistantMessage
                      msg={msg}
                      focusedCallId={chat.focusedCallId()}
                      onFocusCall={focusCall}
                      autoCollapseThinking={!tweaks().showThinkingByDefault}
                      defaultThinkingOpen={tweaks().showThinkingByDefault}
                    />
                  )
                }
              </For>
            </div>
          </div>
        </Show>

        <Composer
          value={input()}
          setValue={setInput}
          onSend={send}
          onStop={() => { chat.abort(); }}
          running={chat.running()}
        />
      </main>

      <Inspector
        open={chat.inspectorOpen()}
        calls={allCalls()}
        focusedCallId={chat.focusedCallId()}
        onClose={() => { chat.setInspectorOpen(false); }}
        onFocusCall={chat.setFocusedCall}
      />

      <TweaksPanel
        open={tweaksOpen()}
        onOpenChange={setTweaksOpen}
        onReplay={(text) => {
          chat.reset();
          // give reset() a tick before sending so the reset state lands first
          queueMicrotask(() => {
            send(text);
          });
        }}
      />
    </>
  );
}

const s = stylex.create({
  center: {
    background: colors.paper,
    flex: "1",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  thread: {
    padding: "24px 0 8px",
    flex: "1",
    scrollBehavior: "smooth",
    overflowY: "auto",
  },
  threadInner: {
    margin: "0 auto",
    padding: "0 28px",
    gap: 28,
    display: "flex",
    flexDirection: "column",
    maxWidth: 760,
  },
  userRow: { alignSelf: "flex-end", maxWidth: "78%" },
  userBubble: {
    background: colors.ink,
    padding: "10px 14px",
    borderRadius: "14px 14px 4px 14px",
    color: colors.paper,
    fontSize: 14,
    lineHeight: 1.55,
  },
});
