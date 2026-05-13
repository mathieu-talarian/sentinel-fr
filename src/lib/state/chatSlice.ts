import type { ChatChunkT } from "@/lib/api/generated/types.gen";
import type { AssistantMessageDataT, MessageT, ToolCallT } from "@/lib/types";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

/**
 * Chat state is keyed by thread id so the workbench (one thread per
 * case) and the legacy `/` chat can coexist. Thread ids in use today:
 *
 *   - `"legacy"` for the `/` route's free-form chat.
 *   - `caseId` for each case workbench's case-aware chat.
 *
 * Only one stream is allowed in-flight at a time site-wide — the abort
 * controller in `chatThunks.ts` is module-scoped. `running` is
 * per-thread so the UI can show which thread is currently streaming.
 */

export const LEGACY_THREAD_ID = "legacy";

export interface ChatThreadStateT {
  messages: MessageT[];
  running: boolean;
  focusedCallId: string | null;
  inspectorOpen: boolean;
  /**
   * Server-issued conversation id, captured from the first `turnStart`
   * chunk of a stream. The legacy `/chat/stream` endpoint persists
   * conversations server-side and reuses this id on subsequent turns.
   * Case-aware chat ignores it.
   */
  conversationId: string | null;
}

export interface ChatStateT {
  // Partial so consumers narrow on missing keys — a thread is materialised
  // lazily on first dispatch via `getOrInit` below.
  threads: Partial<Record<string, ChatThreadStateT>>;
}

const initialThread = (): ChatThreadStateT => ({
  messages: [],
  running: false,
  focusedCallId: null,
  inspectorOpen: false,
  conversationId: null,
});

const initialState: ChatStateT = {
  threads: { [LEGACY_THREAD_ID]: initialThread() },
};

const getOrInit = (state: ChatStateT, threadId: string): ChatThreadStateT => {
  const existing = state.threads[threadId];
  if (existing) return existing;
  const created = initialThread();
  state.threads[threadId] = created;
  return created;
};

const closeThinking = (m: AssistantMessageDataT) => {
  if (m.thinkingActive && m.thinkingStartedAt != null) {
    m.thinkingMs = Date.now() - m.thinkingStartedAt;
    m.thinkingActive = false;
  }
};

const findAssistant = (
  thread: ChatThreadStateT,
  id: string,
): AssistantMessageDataT | undefined => {
  const m = thread.messages.find((x) => x.id === id);
  return m?.role === "assistant" ? m : undefined;
};

interface ApplyChunkPayloadT {
  threadId: string;
  asstId: string;
  chunk: ChatChunkT;
}

const slice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    appendMessages(
      state,
      action: PayloadAction<{ threadId: string; messages: MessageT[] }>,
    ) {
      const t = getOrInit(state, action.payload.threadId);
      t.messages.push(...action.payload.messages);
    },
    setRunning(
      state,
      action: PayloadAction<{ threadId: string; running: boolean }>,
    ) {
      const t = getOrInit(state, action.payload.threadId);
      t.running = action.payload.running;
    },
    setFocusedCall(
      state,
      action: PayloadAction<{ threadId: string; callId: string | null }>,
    ) {
      const t = getOrInit(state, action.payload.threadId);
      t.focusedCallId = action.payload.callId;
    },
    setInspectorOpen(
      state,
      action: PayloadAction<{ threadId: string; open: boolean }>,
    ) {
      const t = getOrInit(state, action.payload.threadId);
      t.inspectorOpen = action.payload.open;
    },
    reset(state, action: PayloadAction<{ threadId: string }>) {
      state.threads[action.payload.threadId] = initialThread();
    },
    finalizeAssistant(
      state,
      action: PayloadAction<{
        threadId: string;
        asstId: string;
        error?: string;
      }>,
    ) {
      const t = getOrInit(state, action.payload.threadId);
      const m = findAssistant(t, action.payload.asstId);
      if (!m) return;
      if (action.payload.error) m.error = action.payload.error;
      m.streaming = false;
      m.thinkingActive = false;
      m.done = true;
    },
    applyChunk(state, action: PayloadAction<ApplyChunkPayloadT>) {
      const { threadId, asstId, chunk } = action.payload;
      const t = getOrInit(state, threadId);
      const m = findAssistant(t, asstId);
      if (!m) return;

      switch (chunk.type) {
        case "turnStart": {
          t.conversationId = chunk.conversationId;
          m.serverId = chunk.messageId;
          return;
        }
        case "reasoning":
        case "reasoningDelta": {
          const append = chunk.type === "reasoningDelta";
          m.thinking = append ? m.thinking + chunk.text : chunk.text;
          m.thinkingActive = true;
          m.thinkingStartedAt ??= Date.now();
          return;
        }
        case "toolCall": {
          closeThinking(m);
          const call: ToolCallT = {
            id: chunk.callId,
            tool: chunk.name,
            args: chunk.args,
            status: "in-flight",
            startedAt: Date.now(),
          };
          m.calls.push(call);
          return;
        }
        case "toolCallDelta": {
          // Live-update the in-flight call's args/name as the model writes.
          const call = m.calls.find((c) => c.id === chunk.callId);
          if (!call) return;
          if (chunk.delta.kind === "name") {
            call.tool = chunk.delta.name;
          }
          return;
        }
        case "toolResult": {
          const call = m.calls.find((c) => c.id === chunk.callId);
          if (call) {
            call.status = "complete";
            call.result = chunk.content;
            call.durationMs = Date.now() - call.startedAt;
          }
          const cav = (chunk.content as { caveats?: string[] } | undefined)
            ?.caveats;
          if (cav?.length) m.caveats = cav;
          return;
        }
        case "toolError": {
          const call = m.calls.find((c) => c.id === chunk.callId);
          if (!call) return;
          call.status = "failed";
          call.durationMs = Date.now() - call.startedAt;
          call.errorCode = chunk.code;
          call.errorMessage = chunk.message;
          return;
        }
        case "delta": {
          closeThinking(m);
          m.reply += chunk.text;
          return;
        }
        case "turnEnd": {
          m.usage = chunk.usage;
          return;
        }
        case "error": {
          m.error = chunk.message;
          m.streaming = false;
          m.thinkingActive = false;
          m.done = true;
          return;
        }
        case "done": {
          m.streaming = false;
          m.thinkingActive = false;
          m.done = true;
          return;
        }
        case "casePatchSuggestion": {
          // Routed to `casesSlice.pendingPatches` from `sendChat` thunk
          // rather than mutating `chatSlice` directly; this case is a
          // no-op here so the chat reducer stays scope-pure.
          return;
        }
      }
    },
  },
});

export const chatActions = slice.actions;
export const chatReducer = slice.reducer;
