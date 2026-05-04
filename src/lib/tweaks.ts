import { createSignal } from 'solid-js'

export type Provider = 'anthropic' | 'openai'

export interface Tweaks {
  theme: 'light' | 'dark'
  density: 'comfortable' | 'compact'
  showThinkingByDefault: boolean
  inspectorAutoOpen: boolean
  lang: 'en' | 'fr'
  provider: Provider
}

const DEFAULT: Tweaks = {
  theme: 'light',
  density: 'comfortable',
  showThinkingByDefault: false,
  inspectorAutoOpen: true,
  lang: 'en',
  provider: 'anthropic',
}

const KEY = 'sentinel.tweaks.v1'

function load(): Tweaks {
  if (typeof localStorage === 'undefined') return DEFAULT
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Tweaks>) }
  } catch {
    return DEFAULT
  }
}

const [tweaks, setTweaksSignal] = createSignal<Tweaks>(load())

function persist(next: Tweaks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // localStorage may be unavailable (private mode, SSR) — non-fatal
  }
}

export function useTweaks() {
  const set = (patch: Partial<Tweaks>) => {
    const next = { ...tweaks(), ...patch }
    setTweaksSignal(next)
    persist(next)
  }
  return [tweaks, set] as const
}
