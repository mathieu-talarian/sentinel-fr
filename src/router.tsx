import type { QueryClient } from "@tanstack/react-query";

import { createRouter as createTanStackRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export interface RouterContextT {
  queryClient: QueryClient;
}

export function getRouter(queryClient: QueryClient) {
  return createTanStackRouter({
    routeTree,
    context: { queryClient } satisfies RouterContextT,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });
}

declare module "@tanstack/react-router" {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
