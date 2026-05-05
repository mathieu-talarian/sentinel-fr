import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export type ProviderT = "anthropic" | "openai";

export interface TweaksT {
  theme: "light" | "dark";
  density: "comfortable" | "compact";
  showThinkingByDefault: boolean;
  inspectorAutoOpen: boolean;
  lang: "en" | "fr";
  provider: ProviderT;
}

const DEFAULT: TweaksT = {
  theme: "light",
  density: "comfortable",
  showThinkingByDefault: false,
  inspectorAutoOpen: true,
  lang: "en",
  provider: "anthropic",
};

const STORAGE_KEY = "sentinel.tweaks.v1";

export function loadTweaks(): TweaksT {
  if (typeof localStorage === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<TweaksT>) };
  } catch {
    return DEFAULT;
  }
}

export function persistTweaks(state: TweaksT) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable (private mode, SSR) — non-fatal
  }
}

const slice = createSlice({
  name: "tweaks",
  initialState: loadTweaks(),
  reducers: {
    setTweaks(state, action: PayloadAction<Partial<TweaksT>>) {
      Object.assign(state, action.payload);
    },
  },
});

export const tweaksActions = slice.actions;
export const tweaksReducer = slice.reducer;
