/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { Heading } from "@/components/atoms/Heading";
import { CaseStatusChip } from "@/components/molecules/CaseStatusChip";
import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { Rail } from "@/components/organisms/Rail";
import { selectCaseStatus } from "@/lib/state/caseStatus";
import { useActiveCase, useSetActiveCase } from "@/lib/state/cases";
import { store } from "@/lib/state/store";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

export const Route = createFileRoute("/cases/$caseId")({
  beforeLoad: ({ location }) => {
    const { status } = store.getState().auth;
    if (status !== "authed") {
      redirect({
        to: "/login",
        search: { next: location.pathname + location.searchStr },
        throw: true,
      });
    }
  },
  component: CaseWorkbenchPage,
});

function CaseWorkbenchPage() {
  // Explicit annotation: TanStack Router's `useParams` inference resolves
  // to an `error`-typed value under tsgo after the `/cases/` index split.
  // Re-asserting the shape pins `caseId` to `string` for the rest of the
  // function. The router itself guarantees a non-empty path segment.
  const params: { caseId: string } = Route.useParams();
  const caseId = params.caseId;
  const setActive = useSetActiveCase();
  const activeCase = useActiveCase();

  // Sync the route param into the active-case slice so the rail + future
  // inspector hooks all read the same id. Cleared when the user navigates
  // away from the workbench (e.g. back to `/cases`).
  useEffect(() => {
    setActive(caseId);
  }, [caseId, setActive]);

  const data = activeCase.data;

  return (
    <Sentry.ErrorBoundary
      fallback={(p) => (
        <ErrorFallback
          error={p.error}
          resetError={() => {
            p.resetError();
          }}
        />
      )}
    >
      <Rail onNewChat={() => undefined} onOpenSettings={() => undefined} />

      <main {...sx(s.main)}>
        {activeCase.isLoading && <div {...sx(s.note)}>Loading…</div>}
        {activeCase.isError && (
          <div {...sx(s.error)}>Couldn't load this case.</div>
        )}
        {data && (
          <>
            <header {...sx(s.head)}>
              <div {...sx(s.titleCol)}>
                <Heading level="h1" size="md">
                  {data.title}
                </Heading>
                <div {...sx(s.subline)}>
                  <CaseStatusChip status={selectCaseStatus(data)} />
                  <span {...sx(s.id)}>{data.id}</span>
                </div>
              </div>
            </header>

            <section {...sx(s.placeholder)}>
              <p {...sx(s.placeholderText)}>
                Workbench layout lands in Phase 4 — facts, line items, quote,
                risk, and evidence panels will mount here.
              </p>
              <p {...sx(s.placeholderSub)}>
                Reference date: {data.referenceDate} · {data.lineItems.length}{" "}
                line item
                {data.lineItems.length === 1 ? "" : "s"}.
              </p>
            </section>
          </>
        )}
      </main>
    </Sentry.ErrorBoundary>
  );
}

const s = stylex.create({
  main: {
    padding: "24px 28px",
    flex: "1",
    gap: 16,
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    overflowY: "auto",
  },
  head: {
    gap: 16,
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
  },
  titleCol: {
    gap: 6,
    display: "flex",
    flexDirection: "column",
  },
  subline: {
    gap: 10,
    alignItems: "center",
    display: "flex",
  },
  id: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  placeholder: {
    padding: "16px 18px",
    borderColor: colors.line,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    backgroundColor: colors.paper2,
    color: colors.ink3,
  },
  placeholderText: {
    margin: 0,
    fontSize: 13,
  },
  placeholderSub: {
    margin: "6px 0 0",
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11.5,
  },
  note: {
    color: colors.ink3,
    fontSize: 13,
    fontStyle: "italic",
  },
  error: {
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
