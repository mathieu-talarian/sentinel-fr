import { defineConfig } from "@hey-api/openapi-ts";

/**
 * Codegen for the Sentinel backend.
 *
 * Source of truth for every endpoint shape lives on the backend at
 * `/api-doc/openapi.json`. Run `yarn run gen:api` whenever the spec changes
 * — this regenerates the typed SDK + TanStack Query helpers under
 * `src/lib/api/generated/`. That dir is git-ignored from eslint
 * (`src/lib/api/generated/**` in `eslint.config.js`) so generated noise
 * doesn't pollute lint runs.
 *
 * The backend dev server is expected at https://localhost:8888 (matches the
 * `apiTarget` in `vite.config.ts`). Override with `OPENAPI_URL=...` when
 * pointing at staging/prod for SDK regeneration.
 */
const SPEC_URL =
  process.env.OPENAPI_URL ?? "https://localhost:8888/api-doc/openapi.json";

export default defineConfig({
  input: SPEC_URL,
  output: {
    path: "src/lib/api/generated",
    // Don't emit the top-level `index.ts` barrel — violates
    // `no-barrel-files`. Consumers import directly from
    // `sdk.gen.ts` / `types.gen.ts` / `@tanstack/react-query.gen.ts`.
    entryFile: false,
    // `@hey-api/client-fetch` still emits its own `client/index.ts`
    // barrel (re-exports from `core/*.gen.ts`), and `core/*.gen.ts`
    // itself uses constructs that trip `no-unsafe-*` / `no-explicit-any`
    // from `strictTsConfigTypeChecked`. Prefix every emitted file with
    // `/* eslint-disable */` so lint can run cleanly across the whole
    // generated tree.
    header: (ctx) => ["/* eslint-disable */", ...ctx.defaultValue],
    postProcess: ["eslint", "prettier"],
  },
  plugins: [
    // Typed `<svc>.gen.ts` SDK functions, e.g. `getConversations({ query })`.
    "zod",
    {
      name: "@hey-api/sdk",
      validator: true,
    },
    // Bare TS types (used by SDK + by hand-written code that wants the shapes).
    // The explicit naming templates append `T` to every emitted type so the
    // output satisfies `@typescript-eslint/naming-convention` (which requires
    // `T` suffix on interfaces/type aliases). We can't use `~hooks.symbols`
    // here — it fires on the operation BASE symbol (`AdminRefreshTrigger`)
    // before composition, producing `AdminRefreshTriggerTData` instead of
    // `AdminRefreshTriggerDataT`. The templates compose AFTER the base.
    {
      name: "@hey-api/typescript",
      definitions: "{{name}}T",
      requests: "{{name}}DataT",
      responses: {
        name: "{{name}}ResponsesT",
        response: "{{name}}ResponseT",
      },
      errors: {
        name: "{{name}}ErrorsT",
        error: "{{name}}ErrorT",
      },
    },
    // Runtime fetch client with credentials + interceptors. Configured at
    // app boot in `src/main.tsx` with `client.setConfig(...)`.
    "@hey-api/client-ky",
    // TanStack Query plugin: `getConversationsOptions(...)`,
    // `signInMutation()`, etc. Drop straight into existing `useQuery` /
    // `useMutation` call sites.
    {
      name: "@tanstack/react-query",
      queryOptions: true,
      mutationOptions: true,
      infiniteQueryOptions: true,
    },
  ],
});
