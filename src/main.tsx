/* @refresh reload */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";

import { configureApiClient } from "@/lib/api/client";
import { store } from "@/lib/state/store";

import { getRouter } from "./router";
import "./styles.css";

configureApiClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});
const router = getRouter(queryClient);

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
