import type { Action, ThunkAction } from "@reduxjs/toolkit";

import { configureStore } from "@reduxjs/toolkit";

import { chatReducer } from "@/lib/state/chatSlice";
import { persistTweaks, tweaksReducer } from "@/lib/state/tweaksSlice";

export const store = configureStore({
  reducer: {
    tweaks: tweaksReducer,
    chat: chatReducer,
  },
});

// Mirror tweaks → localStorage on every change. Cheap reference check — only
// writes when the slice's value identity actually moved.
let lastTweaks = store.getState().tweaks;
store.subscribe(() => {
  const next = store.getState().tweaks;
  if (next !== lastTweaks) {
    lastTweaks = next;
    persistTweaks(next);
  }
});

export type RootStateT = ReturnType<typeof store.getState>;
export type AppDispatchT = typeof store.dispatch;
export type AppThunkT<R = void> = ThunkAction<R, RootStateT, unknown, Action>;
