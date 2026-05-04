import { createSignal } from "solid-js";

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

const KEY = "sentinel.tweaks.v1";

function load(): TweaksT {
  if (typeof localStorage === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<TweaksT>) };
  } catch {
    return DEFAULT;
  }
}

const [tweaks, setTweaksSignal] = createSignal<TweaksT>(load());

function persist(next: TweaksT) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage may be unavailable (private mode, SSR) — non-fatal
  }
}

export function useTweaks() {
  const set = (patch: Partial<TweaksT>) => {
    const next = { ...tweaks(), ...patch };
    setTweaksSignal(next);
    persist(next);
  };
  return [tweaks, set] as const;
}
