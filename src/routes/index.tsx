import type { SuggestionT } from "~/lib/utils/suggestions";

import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect } from "@tanstack/solid-router";
import { Show, createMemo, createSignal, untrack } from "solid-js";

import { UserBubble } from "~/components/molecules/UserBubble";
import { AssistantMessage } from "~/components/organisms/AssistantMessage";
import { ChatThread } from "~/components/organisms/ChatThread";
import { ChatTopbar } from "~/components/organisms/ChatTopbar";
import { Composer } from "~/components/organisms/Composer";
import { EmptyState } from "~/components/organisms/EmptyState";
import { Inspector } from "~/components/organisms/Inspector";
import { Rail } from "~/components/organisms/Rail";
import { TweaksPanel } from "~/components/organisms/TweaksPanel";
import { meQueryOptions } from "~/lib/api/queries";
import { createChatStore } from "~/lib/state/chatStore";
import { useTweaks } from "~/lib/state/tweaks";
import { sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";
import { suggestionTitleFor } from "~/lib/utils/suggestions";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(meQueryOptions());
    if (!session) {
      // `throw: true` makes redirect() throw internally — keeps the signal
      // intact for TanStack Router without a bare `throw` at the call site.
      // `next` lets the login form bounce the user back where they came from.
      redirect({
        to: "/login",
        search: { next: location.pathname + location.searchStr },
        throw: true,
      });
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
        onNewChat={() => {
          chat.reset();
        }}
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
          onProviderChange={(p) => {
            setTweaks({ provider: p });
          }}
          onLangChange={(l) => {
            setTweaks({ lang: l });
          }}
          onToggleInspector={() => {
            chat.setInspectorOpen(!chat.inspectorOpen());
          }}
        />

        <Show when={!isEmpty()} fallback={<EmptyState onPick={onPick} />}>
          <ChatThread
            messages={chat.messages}
            ref={setThreadEl}
            renderMessage={(msg) =>
              msg.role === "user" ? (
                <UserBubble text={msg.text} />
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
          />
        </Show>

        <Composer
          value={input()}
          setValue={setInput}
          onSend={send}
          onStop={() => {
            chat.abort();
          }}
          running={chat.running()}
        />
      </main>

      <Inspector
        open={chat.inspectorOpen()}
        calls={allCalls()}
        focusedCallId={chat.focusedCallId()}
        onClose={() => {
          chat.setInspectorOpen(false);
        }}
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
});
