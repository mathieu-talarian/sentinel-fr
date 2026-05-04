import type { ProviderT } from "./tweaks";
import type {
  AssistantMessageDataT,
  ChatChunkT,
  ChatTurnT,
  MessageT,
  ToolCallT,
  UserMessageDataT,
} from "./types";

import { batch, createSignal, untrack } from "solid-js";
import { createStore, produce } from "solid-js/store";

import { streamChat } from "./chatStream";

interface SendArgsT {
  text: string;
}

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

export interface ChatStoreT {
  messages: readonly MessageT[];
  running: () => boolean;
  focusedCallId: () => string | null;
  inspectorOpen: () => boolean;
  send: (args: SendArgsT) => Promise<void>;
  abort: () => void;
  reset: () => void;
  setFocusedCall: (id: string | null) => void;
  setInspectorOpen: (open: boolean) => void;
}

interface ChatStoreOptsT {
  /** Auto-open the inspector + focus the first tool result that arrives. */
  autoOpenInspector?: () => boolean;
  /** Provider to send with each request — read at send-time so it stays live. */
  provider?: () => ProviderT;
}

const closeThinking = (m: AssistantMessageDataT) => {
  if (m.thinkingActive && m.thinkingStartedAt != null) {
    m.thinkingMs = Date.now() - m.thinkingStartedAt;
    m.thinkingActive = false;
  }
};

const errorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Unknown error";
};

export function createChatStore(opts: ChatStoreOptsT = {}): ChatStoreT {
  const [messages, setMessages] = createStore<MessageT[]>([]);
  const [running, setRunning] = createSignal(false);
  const [focusedCallId, setFocusedCallId] = createSignal<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = createSignal(false);
  let abortCtrl: AbortController | null = null;

  const updateAssistant = (
    id: string,
    fn: (m: AssistantMessageDataT) => void,
  ) => {
    setMessages(
      produce((arr) => {
        const idx = arr.findIndex((m) => m.id === id);
        if (idx === -1) return;
        const m = arr[idx];
        if (m.role !== "assistant") return;
        fn(m);
      }),
    );
  };

  const applyChunk = (asstId: string, chunk: ChatChunkT) => {
    switch (chunk.type) {
      case "reasoning": {
        updateAssistant(asstId, (m) => {
          m.thinking = chunk.text;
          m.thinkingActive = true;
          m.thinkingStartedAt ??= Date.now();
        });
        return;
      }
      case "reasoning_delta": {
        updateAssistant(asstId, (m) => {
          m.thinking = m.thinking + chunk.text;
          m.thinkingActive = true;
          m.thinkingStartedAt ??= Date.now();
        });
        return;
      }
      case "tool_call": {
        updateAssistant(asstId, (m) => {
          closeThinking(m);
          const call: ToolCallT = {
            id: chunk.call_id,
            tool: chunk.name,
            args: chunk.args,
            status: "in-flight",
            startedAt: Date.now(),
          };
          m.calls.push(call);
        });
        return;
      }
      case "tool_result": {
        updateAssistant(asstId, (m) => {
          const call = m.calls.find((c) => c.id === chunk.call_id);
          if (!call) return;
          call.status = "complete";
          call.result = chunk.content;
          call.durationMs = Date.now() - call.startedAt;
          const c = chunk.content as { caveats?: string[] } | undefined;
          if (c?.caveats?.length) m.caveats = c.caveats;
        });
        const shouldOpen = untrack(() => opts.autoOpenInspector?.() ?? true);
        if (shouldOpen) {
          batch(() => {
            setInspectorOpen(true);
            if (untrack(focusedCallId) == null) setFocusedCallId(chunk.call_id);
          });
        }
        return;
      }
      case "delta": {
        updateAssistant(asstId, (m) => {
          closeThinking(m);
          m.reply = m.reply + chunk.text;
        });
        return;
      }
      case "turn_end": {
        updateAssistant(asstId, (m) => {
          m.usage = chunk.usage;
        });
        return;
      }
      case "error": {
        updateAssistant(asstId, (m) => {
          m.error = chunk.message;
          m.streaming = false;
          m.thinkingActive = false;
          m.done = true;
        });
        return;
      }
      case "done": {
        updateAssistant(asstId, (m) => {
          m.streaming = false;
          m.thinkingActive = false;
          m.done = true;
          if (chunk.usage) m.usage = chunk.usage;
        });
        return;
      }
    }
  };

  const send = async ({ text }: SendArgsT) => {
    if (running()) return;

    // Snapshot history BEFORE mutating, otherwise the new user/assistant rows
    // would land in `turns` and the backend would see the user message twice
    // plus an empty assistant turn.
    const turns: ChatTurnT[] = messages
      .filter((m) => m.role === "user" || m.reply)
      .map((m) =>
        m.role === "user"
          ? { role: "user" as const, content: m.text }
          : { role: "assistant" as const, content: m.reply },
      );
    turns.push({ role: "user", content: text });

    const userMsg: UserMessageDataT = { id: newId("u"), role: "user", text };
    const asstId = newId("a");
    const asstMsg = blankAssistant(asstId);

    batch(() => {
      setMessages([...messages, userMsg, asstMsg]);
      setFocusedCallId(null);
      setRunning(true);
    });

    abortCtrl = new AbortController();
    const provider = untrack(() => opts.provider?.());

    try {
      for await (const chunk of streamChat(turns, {
        signal: abortCtrl.signal,
        provider,
      })) {
        applyChunk(asstId, chunk);
      }
    } catch (error) {
      const msg = errorMessage(error);
      // Aborts are user-driven — surface anything else as a stream error.
      if (msg !== "AbortError" && !msg.includes("aborted")) {
        updateAssistant(asstId, (m) => {
          m.error = msg;
        });
      }
      updateAssistant(asstId, (m) => {
        m.streaming = false;
        m.thinkingActive = false;
        m.done = true;
      });
    } finally {
      abortCtrl = null;
      setRunning(false);
    }
  };

  const abort = () => {
    abortCtrl?.abort();
  };

  const reset = () => {
    if (running()) abort();
    batch(() => {
      setMessages([]);
      setFocusedCallId(null);
      setInspectorOpen(false);
    });
  };

  return {
    get messages() {
      return messages;
    },
    running,
    focusedCallId,
    inspectorOpen,
    send,
    abort,
    reset,
    setFocusedCall: setFocusedCallId,
    setInspectorOpen,
  };
}
