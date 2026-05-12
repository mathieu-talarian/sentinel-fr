import type { RootStateT } from "@/lib/state/store";

import { useAppSelector } from "@/lib/state/hooks";

/**
 * Build-time feature flags.
 *
 * The flag value at runtime is OR-ed between two sources, per the workbench
 * plan §3 decision 5:
 *   - `VITE_FEATURE_CASE_WORKBENCH` — set at build time (Vite env) so we can
 *     opt prod cohorts in by deploying with the flag flipped on.
 *   - `tweaks.caseWorkbench` — set at runtime via the Tweaks panel so a dev
 *     can toggle locally without a rebuild.
 *
 * Both are deliberate non-backend signals; per-user entitlement is out of
 * scope until product asks for it.
 */

// `import.meta.env` is typed as `any` for keys we haven't pre-declared;
// match the pattern from `src/lib/observability/sentry.ts`.
const env = import.meta.env as unknown as Record<string, string | undefined>;

export const FEATURE_CASE_WORKBENCH_ENV =
  env.VITE_FEATURE_CASE_WORKBENCH === "true";

/** Pure selector — usable from thunks, route guards, non-React code. */
export const selectFeatureCaseWorkbench = (state: RootStateT): boolean =>
  FEATURE_CASE_WORKBENCH_ENV || state.tweaks.caseWorkbench;

/** Hook variant for components. */
export const useFeatureCaseWorkbench = (): boolean =>
  useAppSelector(selectFeatureCaseWorkbench);
