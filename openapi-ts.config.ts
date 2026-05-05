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
    format: "prettier",
  },
  plugins: [
    // Typed `<svc>.gen.ts` SDK functions, e.g. `getConversations({ query })`.
    "@hey-api/sdk",
    // Bare TS types (used by SDK + by hand-written code that wants the shapes).
    "@hey-api/typescript",
    // Runtime fetch client with credentials + interceptors. Configured at
    // app boot in `src/main.tsx` with `client.setConfig(...)`.
    "@hey-api/client-fetch",
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
