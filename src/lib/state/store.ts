import type { Action, ThunkAction } from "@reduxjs/toolkit";

import { configureStore } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";

import { authReducer } from "@/lib/state/authSlice";
import { casesReducer, persistActiveCaseId } from "@/lib/state/casesSlice";
import { chatReducer } from "@/lib/state/chatSlice";
import { persistTweaks, tweaksReducer } from "@/lib/state/tweaksSlice";

/* Sentry enhancer scrub-list. The chat slice carries user prompts, model
 * reasoning, and tool-call args/results — all stripped before the action
 * breadcrumb or state snapshot leaves the browser. `tweaks` is plain UI
 * prefs and stays in clear.
 *
 * `createReduxEnhancer` types its transformers as `any` in / `any` out,
 * so we accept loose params and narrow at entry. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment,
   @typescript-eslint/no-unsafe-return -- see comment above. */
const REDACTED = "[redacted]" as const;
const REDACTED_CHAT_ACTIONS = new Set<string>([
  "chat/appendMessages",
  "chat/applyChunk",
]);

const scrubMessage = (m: unknown): unknown => {
  if (m === null || typeof m !== "object") return m;
  const msg = m as Record<string, unknown>;
  const rawCalls = msg.calls;
  const calls = Array.isArray(rawCalls)
    ? (rawCalls as unknown[]).map((call) =>
        call !== null && typeof call === "object"
          ? {
              ...(call as Record<string, unknown>),
              args: REDACTED,
              result: REDACTED,
            }
          : call,
      )
    : rawCalls;
  return {
    ...msg,
    reply: typeof msg.reply === "string" ? REDACTED : msg.reply,
    thinking: typeof msg.thinking === "string" ? REDACTED : msg.thinking,
    text: typeof msg.text === "string" ? REDACTED : msg.text,
    calls,
  };
};

const scrubChatState = (chat: unknown): unknown => {
  if (chat === null || typeof chat !== "object") return chat;
  const c = chat as { messages?: unknown };
  if (!Array.isArray(c.messages)) return chat;
  return {
    ...c,
    messages: (c.messages as unknown[]).map((m) => scrubMessage(m)),
  };
};

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  actionTransformer: (action) =>
    REDACTED_CHAT_ACTIONS.has(action.type as string)
      ? { ...action, payload: REDACTED }
      : action,
  stateTransformer: (state) => {
    if (state === null || typeof state !== "object") return state;
    const s = state as Record<string, unknown>;
    return { ...s, chat: scrubChatState(s.chat) };
  },
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment,
   @typescript-eslint/no-unsafe-return */

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tweaks: tweaksReducer,
    chat: chatReducer,
    cases: casesReducer,
  },
  // RTK's `enhancers` callback must return a `Tuple` — `concat` preserves
  // that branded type, whereas `[...spread]` would degrade to a plain array.
  // eslint-disable-next-line unicorn/prefer-spread
  enhancers: (getDefault) => getDefault().concat(sentryReduxEnhancer),
});

// Mirror tweaks + cases.activeCaseId → localStorage on every change. Cheap
// reference checks — only writes when the relevant slice value moved.
let lastTweaks = store.getState().tweaks;
let lastActiveCaseId = store.getState().cases.activeCaseId;
store.subscribe(() => {
  const next = store.getState();
  if (next.tweaks !== lastTweaks) {
    lastTweaks = next.tweaks;
    persistTweaks(next.tweaks);
  }
  if (next.cases.activeCaseId !== lastActiveCaseId) {
    lastActiveCaseId = next.cases.activeCaseId;
    persistActiveCaseId(lastActiveCaseId);
  }
});

export type RootStateT = ReturnType<typeof store.getState>;
export type AppDispatchT = typeof store.dispatch;
export type AppThunkT<R = void> = ThunkAction<R, RootStateT, unknown, Action>;
