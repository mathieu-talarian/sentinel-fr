/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import type { CaseInspectorTabT } from "@/components/organisms/CaseInspector";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { Heading } from "@/components/atoms/Heading";
import { CaseStatusChip } from "@/components/molecules/CaseStatusChip";
import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { MissingFieldChip } from "@/components/molecules/MissingFieldChip";
import { CaseChatSurface } from "@/components/organisms/CaseChatSurface";
import {
  CaseInspector,
  asInspectorTab,
} from "@/components/organisms/CaseInspector";
import { Rail } from "@/components/organisms/Rail";
import {
  selectCaseStatus,
  selectMissingCaseFacts,
} from "@/lib/state/caseStatus";
import { useActiveCase, useSetActiveCase } from "@/lib/state/cases";
import { store } from "@/lib/state/store";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

const WorkbenchSearchSchema = z.object({
  tab: z.enum(["facts", "lines", "quote", "risks", "evidence"]).optional(),
});

export const Route = createFileRoute("/cases/$caseId")({
  validateSearch: WorkbenchSearchSchema,
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
  const search = Route.useSearch();
  const navigate = useNavigate();
  const setActive = useSetActiveCase();
  const activeCase = useActiveCase();

  const currentTab = asInspectorTab(search.tab);
  const onTabChange = (tab: CaseInspectorTabT) => {
    void navigate({
      to: "/cases/$caseId",
      params: { caseId },
      search: () => (tab === "facts" ? {} : { tab }),
    });
  };

  // Sync the route param into the active-case slice so the rail's
  // active-row indicator stays in sync. Clearing happens at the next
  // navigation that calls `setActive(null)` — for now we never clear.
  useEffect(() => {
    setActive(caseId);
  }, [caseId, setActive]);

  const data = activeCase.data;
  const isReadOnly = data?.status === "archived";

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

            <MissingFactsStrip case_={data} />

            <CaseChatSurface case_={data} isReadOnly={isReadOnly} />
          </>
        )}
      </main>

      {data && (
        <CaseInspector
          case_={data}
          isReadOnly={isReadOnly}
          tab={currentTab}
          onTabChange={onTabChange}
        />
      )}
    </Sentry.ErrorBoundary>
  );
}

function MissingFactsStrip(
  props: Readonly<{ case_: Parameters<typeof selectMissingCaseFacts>[0] }>,
) {
  const missing = selectMissingCaseFacts(props.case_);
  if (missing.length === 0) return null;
  return (
    <div {...sx(s.missingStrip)}>
      <span {...sx(s.missingLabel)}>Missing for quote</span>
      {missing.map((f) => (
        <MissingFieldChip key={f} field={f} />
      ))}
    </div>
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
  missingStrip: {
    padding: "8px 12px",
    borderColor: colors.warnSoft,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    alignItems: "center",
    backgroundColor: colors.warnSoft,
    display: "flex",
    flexWrap: "wrap",
  },
  missingLabel: {
    color: colors.warn,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
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
