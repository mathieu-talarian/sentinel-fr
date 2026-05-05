import type { AppThunkT } from "@/lib/state/store";
import type {
  AssistantMessageDataT,
  ChatTurnT,
  UserMessageDataT,
} from "@/lib/types";

import { streamChat } from "@/lib/api/chatStream";
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

    try {
      for await (const chunk of streamChat(turns, {
        signal: abortCtrl.signal,
        provider,
        lang,
      })) {
        dispatch(chatActions.applyChunk({ asstId, chunk }));

        // Auto-open inspector + focus first tool result if the user hasn't
        // disabled it. Read tweaks lazily so toggling mid-stream is honoured.
        if (chunk.type === "tool_result") {
          const { tweaks, chat } = getState();
          if (tweaks.inspectorAutoOpen) {
            dispatch(chatActions.setInspectorOpen(true));
            if (chat.focusedCallId == null) {
              dispatch(chatActions.setFocusedCall(chunk.call_id));
            }
          }
        }
      }
    } catch (error) {
      const msg = errorMessage(error);
      // Aborts are user-driven — surface anything else as a stream error.
      const isAbort = msg === "AbortError" || msg.includes("aborted");
      dispatch(
        chatActions.finalizeAssistant({
          asstId,
          error: isAbort ? undefined : msg,
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
