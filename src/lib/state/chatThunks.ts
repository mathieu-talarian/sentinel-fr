import type {
  ConversationMessageT,
  ToolCallViewT,
} from "@/lib/api/generated/types.gen";
import type { AppThunkT } from "@/lib/state/store";
import type {
  AssistantMessageDataT,
  ChatTurnT,
  MessageT,
  ToolCallStatusT,
  ToolCallT,
  UserMessageDataT,
} from "@/lib/types";

import * as Sentry from "@sentry/react";

import { streamChat } from "@/lib/api/chatStream";
import { conversationGet } from "@/lib/api/generated/sdk.gen";
import { chatActions } from "@/lib/state/chatSlice";

const newId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;

const blankAssistant = (id: string): AssistantMessageDataT => ({
  id,
  role: "assistant",
  thinking: "",
  thinkingActive: true,
  thinkingMs: undefined,
  thinkingStartedAt: Date.now(),
  calls: [],
  reply: "",
  streaming: true,
  caveats: undefined,
  done: false,
});

const errorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
};

interface StreamErrorContextT {
  asstId: string;
  provider?: string;
  lang?: string;
  conversationId?: string;
}

// Aborts are user-driven (Stop button) so we never want them in Sentry; any
// other stream failure ships with the call context so the breadcrumb chain
// (network, fetch URL, conversation id) is enough to reproduce.
const reportStreamError = (
  error: unknown,
  ctx: StreamErrorContextT,
): { aborted: boolean; message: string } => {
  const message = errorMessage(error);
  const aborted = message === "AbortError" || message.includes("aborted");
  if (!aborted) {
    Sentry.captureException(error, {
      tags: { source: "chat-stream" },
      extra: { ...ctx },
    });
  }
  return { aborted, message };
};

// AbortController is not serializable so it lives outside Redux state.
let abortCtrl: AbortController | null = null;

export const sendChat =
  (text: string): AppThunkT<Promise<void>> =>
  async (dispatch, getState) => {
    if (getState().chat.running) return;

    // Snapshot history BEFORE mutating, otherwise the backend would see the
    // new user message twice plus an empty assistant turn.
    const turns: ChatTurnT[] = getState()
      .chat.messages.filter((m) => m.role === "user" || m.reply)
      .map((m) =>
        m.role === "user"
          ? { role: "user" as const, content: m.text }
          : { role: "assistant" as const, content: m.reply },
      );
    turns.push({ role: "user", content: text });

    const userMsg: UserMessageDataT = { id: newId("u"), role: "user", text };
    const asstId = newId("a");
    const asstMsg = blankAssistant(asstId);

    dispatch(chatActions.appendMessages([userMsg, asstMsg]));
    dispatch(chatActions.setFocusedCall(null));
    dispatch(chatActions.setRunning(true));

    abortCtrl = new AbortController();
    const { provider, lang } = getState().tweaks;
    const conversationId = getState().chat.conversationId ?? undefined;

    try {
      for await (const chunk of streamChat(turns, {
        signal: abortCtrl.signal,
        provider,
        lang,
        conversationId,
      })) {
        dispatch(chatActions.applyChunk({ asstId, chunk }));

        // Auto-open inspector + focus first tool result if the user hasn't
        // disabled it. Read tweaks lazily so toggling mid-stream is honoured.
        if (chunk.type === "toolResult") {
          const { tweaks, chat } = getState();
          if (tweaks.inspectorAutoOpen) {
            dispatch(chatActions.setInspectorOpen(true));
            if (chat.focusedCallId == null) {
              dispatch(chatActions.setFocusedCall(chunk.callId));
            }
          }
        }
      }
    } catch (error) {
      const { aborted, message } = reportStreamError(error, {
        asstId,
        provider,
        lang,
        conversationId,
      });
      dispatch(
        chatActions.finalizeAssistant({
          asstId,
          error: aborted ? undefined : message,
        }),
      );
    } finally {
      abortCtrl = null;
      dispatch(chatActions.setRunning(false));
    }
  };

export const abortChat: AppThunkT = () => {
  abortCtrl?.abort();
};

export const resetChat: AppThunkT = (dispatch, getState) => {
  if (getState().chat.running) abortCtrl?.abort();
  dispatch(chatActions.reset());
};

const callStatus = (s: string): ToolCallStatusT => {
  if (s === "in-flight" || s === "complete" || s === "failed") return s;
  return "complete";
};

const toFECall = (c: ToolCallViewT): ToolCallT => ({
  id: c.id,
  tool: c.tool,
  args: c.args,
  status: callStatus(c.status),
  // Persisted view doesn't carry the wall-clock start; only `durationMs`
  // matters for the rendered "(312ms)" suffix on the call pill.
  startedAt: 0,
  durationMs: c.durationMs ?? undefined,
  result: c.result ?? undefined,
  errorCode: c.code ?? undefined,
  errorMessage: c.message ?? undefined,
});

const toFEMessage = (m: ConversationMessageT): MessageT => {
  if (m.role === "user") {
    return { id: m.id, role: "user", text: m.content };
  }
  return {
    id: m.id,
    serverId: m.id,
    role: "assistant",
    thinking: "",
    thinkingActive: false,
    calls: (m.toolCalls ?? []).map((c) => toFECall(c)),
    reply: m.content,
    streaming: false,
    done: true,
    usage: m.usage ?? undefined,
  };
};

/**
 * Replace the rendered chat with a persisted conversation. Aborts any
 * in-flight stream first so the user doesn't see deltas land into the
 * newly-loaded thread. Subsequent `sendChat` calls append to this
 * conversation server-side because `state.chat.conversationId` is set.
 */
export const loadConversation =
  (id: string): AppThunkT<Promise<void>> =>
  async (dispatch) => {
    abortCtrl?.abort();
    abortCtrl = null;

    const r = await conversationGet({ path: { id }, throwOnError: false });
    if (!r.data) {
      const status = r.response?.status ?? 0;
      Sentry.captureException(
        new Error(`conversationGet failed: HTTP ${status.toString()}`),
        {
          tags: { source: "load-conversation" },
          extra: { conversationId: id, httpStatus: status },
        },
      );
      return;
    }

    const messages: MessageT[] = r.data.messages.map((m) => toFEMessage(m));
    dispatch(chatActions.loadConversation({ conversationId: id, messages }));
  };
