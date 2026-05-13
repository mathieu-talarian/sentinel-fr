/**
 * Build-time feature flags.
 *
 * The import-case workbench is the only mounted surface as of the
 * Phase 9 cleanup. `FEATURE_CASE_WORKBENCH_ENV` stays as an env-level
 * read so a deploy can flip `VITE_FEATURE_CASE_WORKBENCH=false`, but
 * the legacy chat path that used to honour that flag has been
 * deleted; flipping the env now is a no-op at runtime. The constant
 * is kept so a future rollback / scratchpad mode can grow back
 * without re-introducing the env plumbing.
 */

// `import.meta.env` is typed as `any` for keys we haven't pre-declared;
// match the pattern from `src/lib/observability/sentry.ts`.
const env = import.meta.env as unknown as Record<string, string | undefined>;

export const FEATURE_CASE_WORKBENCH_ENV =
  env.VITE_FEATURE_CASE_WORKBENCH !== "false";
