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
}

const initialState: ChatStateT = {
  messages: [],
  running: false,
  focusedCallId: null,
  inspectorOpen: false,
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
        case "reasoning":
        case "reasoning_delta": {
          const append = chunk.type === "reasoning_delta";
          m.thinking = append ? m.thinking + chunk.text : chunk.text;
          m.thinkingActive = true;
          m.thinkingStartedAt ??= Date.now();
          return;
        }
        case "tool_call": {
          closeThinking(m);
          const call: ToolCallT = {
            id: chunk.call_id,
            tool: chunk.name,
            args: chunk.args,
            status: "in-flight",
            startedAt: Date.now(),
          };
          m.calls.push(call);
          return;
        }
        case "tool_result": {
          const call = m.calls.find((c) => c.id === chunk.call_id);
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
        case "delta": {
          closeThinking(m);
          m.reply += chunk.text;
          return;
        }
        case "turn_end": {
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
          if (chunk.usage) m.usage = chunk.usage;
          return;
        }
      }
    },
  },
});

export const chatActions = slice.actions;
export const chatReducer = slice.reducer;
