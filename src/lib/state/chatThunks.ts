import type {
  ConversationMessageT,
  ToolCallViewT,
} from "@/lib/api/generated/types.gen";
import type { AppThunkT, RootStateT } from "@/lib/state/store";
import type {
  AssistantMessageDataT,
  ChatTurnT,
  MessageT,
  ToolCallStatusT,
  ToolCallT,
  UserMessageDataT,
} from "@/lib/types";
import type { Dispatch } from "@reduxjs/toolkit";

import * as Sentry from "@sentry/react";

import { streamChat } from "@/lib/api/chatStream";
import { conversationGet } from "@/lib/api/generated/sdk.gen";
import { casesActions } from "@/lib/state/casesSlice";
import { LEGACY_THREAD_ID, chatActions } from "@/lib/state/chatSlice";

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
  threadId: string;
  asstId: string;
  provider?: string;
  lang?: string;
  conversationId?: string;
  caseId?: string;
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
    const tags: Record<string, string> = { source: "chat-stream" };
    if (ctx.caseId) tags["import_case.id"] = ctx.caseId;
    Sentry.captureException(error, {
      tags,
      extra: { ...ctx },
    });
  }
  return { aborted, message };
};

// AbortController is not serializable so it lives outside Redux state.
// Only one stream allowed in-flight at a time site-wide; starting a new
// stream while another is running is a no-op (see early return below).
let abortCtrl: AbortController | null = null;

const turnsFromThread = (
  messages: readonly MessageT[],
  next: string,
): ChatTurnT[] => {
  const turns: ChatTurnT[] = messages
    .filter((m) => m.role === "user" || m.reply)
    .map((m) =>
      m.role === "user"
        ? { role: "user" as const, content: m.text }
        : { role: "assistant" as const, content: m.reply },
    );
  turns.push({ role: "user", content: next });
  return turns;
};

const dispatchToolResultSideEffects = (
  dispatch: Dispatch,
  getState: () => RootStateT,
  threadId: string,
  callId: string,
) => {
  const { tweaks, chat } = getState();
  if (!tweaks.inspectorAutoOpen) return;
  dispatch(chatActions.setInspectorOpen({ threadId, open: true }));
  if (chat.threads[threadId]?.focusedCallId == null) {
    dispatch(chatActions.setFocusedCall({ threadId, callId }));
  }
};

export const sendChat =
  (threadId: string, text: string): AppThunkT<Promise<void>> =>
  async (dispatch, getState) => {
    const state = getState();
    const anyRunning = Object.values(state.chat.threads).some(
      (t) => t?.running,
    );
    if (anyRunning) return;

    const thread = state.chat.threads[threadId];
    const conversationId = thread?.conversationId ?? undefined;
    const turns = turnsFromThread(thread?.messages ?? [], text);

    const userMsg: UserMessageDataT = { id: newId("u"), role: "user", text };
    const asstId = newId("a");
    const asstMsg = blankAssistant(asstId);

    dispatch(
      chatActions.appendMessages({ threadId, messages: [userMsg, asstMsg] }),
    );
    dispatch(chatActions.setFocusedCall({ threadId, callId: null }));
    dispatch(chatActions.setRunning({ threadId, running: true }));

    abortCtrl = new AbortController();
    const { provider, lang } = state.tweaks;
    const caseId = threadId === LEGACY_THREAD_ID ? undefined : threadId;

    try {
      for await (const chunk of streamChat(turns, {
        signal: abortCtrl.signal,
        provider,
        lang,
        conversationId,
        caseId,
      })) {
        dispatch(chatActions.applyChunk({ threadId, asstId, chunk }));
        if (chunk.type === "casePatchSuggestion") {
          dispatch(casesActions.pushPendingPatches(chunk.patches));
        } else if (chunk.type === "toolResult") {
          dispatchToolResultSideEffects(
            dispatch,
            getState,
            threadId,
            chunk.callId,
          );
        }
      }
    } catch (error) {
      const { aborted, message } = reportStreamError(error, {
        threadId,
        asstId,
        provider,
        lang,
        conversationId,
        caseId,
      });
      dispatch(
        chatActions.finalizeAssistant({
          threadId,
          asstId,
          error: aborted ? undefined : message,
        }),
      );
    } finally {
      abortCtrl = null;
      dispatch(chatActions.setRunning({ threadId, running: false }));
    }
  };

export const abortChat: AppThunkT = () => {
  abortCtrl?.abort();
};

export const resetChat =
  (threadId: string): AppThunkT =>
  (dispatch, getState) => {
    const thread = getState().chat.threads[threadId];
    if (thread?.running) abortCtrl?.abort();
    dispatch(chatActions.reset({ threadId }));
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
 * in-flight stream first. Used by the legacy `/` route only; case
 * threads don't have server-side conversation persistence yet.
 */
export const loadConversation =
  (threadId: string, id: string): AppThunkT<Promise<void>> =>
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
    dispatch(
      chatActions.loadConversation({
        threadId,
        conversationId: id,
        messages,
      }),
    );
  };
