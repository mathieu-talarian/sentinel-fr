/* @refresh reload */

import * as Sentry from "@sentry/react";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";

import { configureApiClient } from "@/lib/api/client";
import { initSentry } from "@/lib/observability/sentry";
import { subscribeAuth } from "@/lib/state/authThunks";
import { store } from "@/lib/state/store";

import { getRouter } from "./router";
import "./styles.css";

configureApiClient();

const queryClient = new QueryClient({
  // Forward all unhandled query/mutation errors to Sentry. UI-level error
  // rendering still owns user-facing messaging — this is an observability
  // sink, not a substitute for `useQuery({ ... })` error states.
  queryCache: new QueryCache({
    onError: (error, query) => {
      Sentry.captureException(error, {
        tags: { source: "react-query" },
        extra: { queryKey: query.queryKey, queryHash: query.queryHash },
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      // Per-mutation context comes through `meta.tags` (set by case-aware
      // panels, e.g. `meta: { tags: { "import_case.id": case_.id } }`).
      // Merging here means every case-scoped failure carries the case id
      // without each panel touching Sentry directly.
      const meta = mutation.options.meta as
        | { tags?: Record<string, string> }
        | undefined;
      Sentry.captureException(error, {
        tags: { source: "react-query-mutation", ...meta?.tags },
        extra: { mutationKey: mutation.options.mutationKey },
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});
const router = getRouter(queryClient);

// Sentry needs the live router instance for the TanStack Router browser
// tracing integration, so this runs after `getRouter` and before `render`.
// `window.onerror` / `unhandledrejection` are auto-captured once `init` runs.
initSentry(router);

// Wait for Firebase to settle on a user (or `null`) before mounting React.
// Route guards (`beforeLoad`) read `store.getState().auth.status`; without
// this gate they'd see "loading" on cold start and either block or flicker.
// The listener stays subscribed afterwards — every later sign-in / sign-out
// / token refresh keeps syncing to Redux.
await subscribeAuth(store.dispatch);

const root = document.querySelector("#root");
if (!root) throw new Error("Missing #root mount node");

createRoot(root).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ReduxProvider>
  </StrictMode>,
);
