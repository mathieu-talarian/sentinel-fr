import type { RootStateT } from "@/lib/state/store";

import { useAppSelector } from "@/lib/state/hooks";

/**
 * Build-time feature flags.
 *
 * As of Phase 9 the case workbench is the default surface. Deployments
 * can fall back to the legacy `/` chat by setting
 * `VITE_FEATURE_CASE_WORKBENCH=false` — useful only as a quick rollback
 * lever while we still keep the legacy components mounted. The dev-side
 * `tweaks.caseWorkbench` toggle continues to OR on top, so a developer
 * can force the workbench on even when a build was shipped with the
 * env flag explicitly disabled.
 *
 * Both are deliberate non-backend signals; per-user entitlement is out
 * of scope until product asks for it.
 */

// `import.meta.env` is typed as `any` for keys we haven't pre-declared;
// match the pattern from `src/lib/observability/sentry.ts`.
const env = import.meta.env as unknown as Record<string, string | undefined>;

export const FEATURE_CASE_WORKBENCH_ENV =
  env.VITE_FEATURE_CASE_WORKBENCH !== "false";

/** Pure selector — usable from thunks, route guards, non-React code. */
export const selectFeatureCaseWorkbench = (state: RootStateT): boolean =>
  FEATURE_CASE_WORKBENCH_ENV || state.tweaks.caseWorkbench;

/** Hook variant for components. */
export const useFeatureCaseWorkbench = (): boolean =>
  useAppSelector(selectFeatureCaseWorkbench);
