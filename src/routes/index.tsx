/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import type { SuggestionT } from "@/lib/utils/suggestions";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";

import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { UserBubble } from "@/components/molecules/UserBubble";
import { AssistantMessage } from "@/components/organisms/AssistantMessage";
import { ChatThread } from "@/components/organisms/ChatThread";
import { ChatTopbar } from "@/components/organisms/ChatTopbar";
import { Composer } from "@/components/organisms/Composer";
import { EmptyState } from "@/components/organisms/EmptyState";
import { Inspector } from "@/components/organisms/Inspector";
import { Rail } from "@/components/organisms/Rail";
import { TweaksPanel } from "@/components/organisms/TweaksPanel";
import { useChatStore } from "@/lib/state/chatStore";
import { store } from "@/lib/state/store";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";
import { suggestionTitleFor } from "@/lib/utils/suggestions";

export const Route = createFileRoute("/")({
  // `subscribeAuth` in main.tsx awaits the first onAuthStateChanged callback
  // before mounting React, so the slice is always settled here.
  beforeLoad: ({ location }) => {
    const { status } = store.getState().auth;
    if (status !== "authed") {
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
  const chat = useChatStore();
  const [input, setInput] = useState("");
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const isEmpty = chat.messages.length === 0;

  const firstUserText = useMemo(() => {
    const u = chat.messages.find((m) => m.role === "user");
    return u?.role === "user" ? u.text : "";
  }, [chat.messages]);

  const headerTitle = useMemo(() => {
    if (isEmpty) return "New chat";
    return suggestionTitleFor(firstUserText) ?? "Conversation";
  }, [isEmpty, firstUserText]);

  const allCalls = useMemo(
    () => chat.messages.flatMap((m) => (m.role === "assistant" ? m.calls : [])),
    [chat.messages],
  );
  const hasAnyResults = allCalls.some((c) => c.result != null);

  const send = (text: string) => {
    chat.send({ text });
    queueMicrotask(() => {
      const el = threadRef.current;
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
    <Sentry.ErrorBoundary
      fallback={(p) => (
        <ErrorFallback
          error={p.error}
          resetError={() => {
            p.resetError();
          }}
        />
      )}
    >
      <Rail
        onNewChat={() => {
          chat.reset();
        }}
        onOpenSettings={() => {
          setTweaksOpen(true);
        }}
      />

      <main {...sx(s.center)}>
        <ChatTopbar
          title={headerTitle}
          provider={tweaks.provider}
          lang={tweaks.lang}
          running={chat.running}
          inspectorOpen={chat.inspectorOpen}
          inspectorEnabled={hasAnyResults}
          onProviderChange={(p) => {
            setTweaks({ provider: p });
          }}
          onLangChange={(l) => {
            setTweaks({ lang: l });
          }}
          onToggleInspector={() => {
            chat.setInspectorOpen(!chat.inspectorOpen);
          }}
        />

        {isEmpty ? (
          <EmptyState onPick={onPick} />
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
                  onFocusCall={focusCall}
                  autoCollapseThinking={!tweaks.showThinkingByDefault}
                  defaultThinkingOpen={tweaks.showThinkingByDefault}
                />
              )
            }
          />
        )}

        <Composer
          value={input}
          setValue={setInput}
          onSend={send}
          onStop={() => {
            chat.abort();
          }}
          running={chat.running}
        />
      </main>

      <Inspector
        open={chat.inspectorOpen}
        calls={allCalls}
        focusedCallId={chat.focusedCallId}
        onClose={() => {
          chat.setInspectorOpen(false);
        }}
        onFocusCall={chat.setFocusedCall}
      />

      <TweaksPanel
        open={tweaksOpen}
        onOpenChange={setTweaksOpen}
        onReplay={(text) => {
          chat.reset();
          // give reset() a tick before sending so the reset state lands first
          queueMicrotask(() => {
            send(text);
          });
        }}
      />
    </Sentry.ErrorBoundary>
  );
}

const s = stylex.create({
  center: {
    flex: "1",
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
});
