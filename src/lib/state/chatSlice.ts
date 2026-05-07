import type {
  AssistantMessageDataT,
  ChatChunkT,
  MessageT,
  ToolCallT,
} from "@/lib/types";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export interface ChatStateT {
  messages: MessageT[];
  running: boolean;
  focusedCallId: string | null;
  inspectorOpen: boolean;
  /**
   * Server-issued conversation id, captured from the first `turnStart`
   * chunk of a stream. When set, `sendChat` forwards it on subsequent
   * turns so the backend resumes server-side history instead of
   * round-tripping the full transcript.
   */
  conversationId: string | null;
}

const initialState: ChatStateT = {
  messages: [],
  running: false,
  focusedCallId: null,
  inspectorOpen: false,
  conversationId: null,
};

const closeThinking = (m: AssistantMessageDataT) => {
  if (m.thinkingActive && m.thinkingStartedAt != null) {
    m.thinkingMs = Date.now() - m.thinkingStartedAt;
    m.thinkingActive = false;
  }
};

const findAssistant = (
  state: ChatStateT,
  id: string,
): AssistantMessageDataT | undefined => {
  const m = state.messages.find((x) => x.id === id);
  return m?.role === "assistant" ? m : undefined;
};

const slice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    appendMessages(state, action: PayloadAction<MessageT[]>) {
      state.messages.push(...action.payload);
    },
    setRunning(state, action: PayloadAction<boolean>) {
      state.running = action.payload;
    },
    setFocusedCall(state, action: PayloadAction<string | null>) {
      state.focusedCallId = action.payload;
    },
    setInspectorOpen(state, action: PayloadAction<boolean>) {
      state.inspectorOpen = action.payload;
    },
    reset() {
      return initialState;
    },
    loadConversation(
      state,
      action: PayloadAction<{ conversationId: string; messages: MessageT[] }>,
    ) {
      state.messages = action.payload.messages;
      state.conversationId = action.payload.conversationId;
      state.running = false;
      state.focusedCallId = null;
      state.inspectorOpen = false;
    },
    finalizeAssistant(
      state,
      action: PayloadAction<{ asstId: string; error?: string }>,
    ) {
      const m = findAssistant(state, action.payload.asstId);
      if (!m) return;
      if (action.payload.error) m.error = action.payload.error;
      m.streaming = false;
      m.thinkingActive = false;
      m.done = true;
    },
    applyChunk(
      state,
      action: PayloadAction<{ asstId: string; chunk: ChatChunkT }>,
    ) {
      const { asstId, chunk } = action.payload;
      const m = findAssistant(state, asstId);
      if (!m) return;

      switch (chunk.type) {
        case "turnStart": {
          state.conversationId = chunk.conversationId;
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
          // For `args` we accumulate the streamed JSON text on a private
          // `_argsText` field on the call; once the model emits `toolResult`
          // the `args` field is already the parsed object so this stays
          // best-effort cosmetic.
          const call = m.calls.find((c) => c.id === chunk.callId);
          if (!call) return;
          if (chunk.delta.kind === "name") {
            call.tool = chunk.delta.name;
          }
          // `args` deltas are JSON fragments — we don't try to render
          // partial JSON, just leave the existing `args` value alone.
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
      }
    },
  },
});

export const chatActions = slice.actions;
export const chatReducer = slice.reducer;
