import { createFileRoute, redirect } from "@tanstack/react-router";

import { store } from "@/lib/state/store";

/**
 * The `/` route is now a thin redirect to the workbench. Authed users
 * land on their last active case (or `/cases` when none is set);
 * unauthed users bounce to `/login`. The legacy chat surface that used
 * to mount here was removed along with the Phase 9 flag flip.
 */
export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    const state = store.getState();
    if (state.auth.status !== "authed") {
      redirect({
        to: "/login",
        search: { next: location.pathname + location.searchStr },
        throw: true,
      });
    }
    const activeId = state.cases.activeCaseId;
    if (activeId !== null) {
      redirect({
        to: "/cases/$caseId",
        params: { caseId: activeId },
        throw: true,
      });
    }
    redirect({ to: "/cases", throw: true });
  },
});
