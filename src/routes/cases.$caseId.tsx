/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import type { CaseInspectorTabT } from "@/components/organisms/CaseInspector";
import type { ImportCaseResponseT } from "@/lib/api/generated/types.gen";
import type { MissingCaseFactKeyT } from "@/lib/state/caseStatus";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { CaseStatusChip } from "@/components/molecules/CaseStatusChip";
import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { MissingFactsStrip } from "@/components/molecules/MissingFactsStrip";
import { CaseChatSurface } from "@/components/organisms/CaseChatSurface";
import {
  CaseInspector,
  asInspectorTab,
} from "@/components/organisms/CaseInspector";
import { Rail } from "@/components/organisms/Rail";
import {
  importCaseGetQueryKey,
  importCaseListQueryKey,
  importCasePatchMutation,
  importCaseRiskScreenLatestOptions,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { selectCaseStatus } from "@/lib/state/caseStatus";
import { useActiveCase, useSetActiveCase } from "@/lib/state/cases";
import { store } from "@/lib/state/store";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { scrollMissingFact } from "@/lib/utils/scrollMissingFact";

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

  // Latest risk screen fed into `selectCaseStatus` so the header chip
  // flips on real verdicts (`needsReview` / `readyForBroker`) once Phase 7
  // backend has weighed in. 404 = no screen yet — treat as null.
  const riskScreenQ = useQuery({
    ...importCaseRiskScreenLatestOptions({ path: { caseId } }),
    throwOnError: false,
    enabled: activeCase.data != null,
  });

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

  const onMissingFieldClick = (field: MissingCaseFactKeyT) => {
    const targetTab: CaseInspectorTabT =
      field === "lineItems" ? "lines" : "facts";
    void navigate({
      to: "/cases/$caseId",
      params: { caseId },
      search: () => (targetTab === "facts" ? {} : { tab: targetTab }),
    });
    if (targetTab === "facts") scrollMissingFact(field);
  };

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
      <Rail />

      <main {...sx(s.main)}>
        {activeCase.isLoading && <div {...sx(s.note)}>Loading…</div>}
        {activeCase.isError && (
          <div {...sx(s.error)}>Couldn't load this case.</div>
        )}
        {data && (
          <>
            <WorkbenchHeader
              case_={data}
              riskScreen={riskScreenQ.data ?? null}
            />
            <MissingFactsStrip
              case_={data}
              onFieldClick={onMissingFieldClick}
            />
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

interface WorkbenchHeaderPropsT {
  case_: ImportCaseResponseT;
  riskScreen: Parameters<typeof selectCaseStatus>[1];
}

function WorkbenchHeader(props: Readonly<WorkbenchHeaderPropsT>) {
  const { case_ } = props;
  const queryClient = useQueryClient();
  const archived = case_.status === "archived";

  const archiveMut = useMutation({
    ...importCasePatchMutation(),
    meta: { tags: { "import_case.id": case_.id } },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: importCaseGetQueryKey({ path: { caseId: case_.id } }),
        }),
        queryClient.invalidateQueries({
          queryKey: importCaseListQueryKey(),
        }),
      ]);
    },
  });

  const toggleArchive = () => {
    archiveMut.mutate({
      body: { status: archived ? "ready_for_review" : "archived" },
      path: { caseId: case_.id },
    });
  };

  const status = selectCaseStatus(case_, props.riskScreen);
  const archiveLabel = pickArchiveLabel(archiveMut.isPending, archived);

  return (
    <header {...sx(s.head)}>
      <div {...sx(s.titleCol)}>
        <Heading level="h1" size="md">
          {case_.title}
        </Heading>
        <div {...sx(s.subline)}>
          <CaseStatusChip status={status} />
          <span {...sx(s.id)}>{case_.id}</span>
        </div>
      </div>
      <Button
        variant="secondary"
        onClick={toggleArchive}
        disabled={archiveMut.isPending}
      >
        {archiveLabel}
      </Button>
    </header>
  );
}

const pickArchiveLabel = (busy: boolean, archived: boolean): string => {
  if (busy) return "Saving…";
  if (archived) return "Unarchive";
  return "Archive";
};

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
  titleCol: { gap: 6, display: "flex", flexDirection: "column" },
  subline: { gap: 10, alignItems: "center", display: "flex" },
  id: { color: colors.ink4, fontFamily: fonts.mono, fontSize: 11 },
  note: { color: colors.ink3, fontSize: 13, fontStyle: "italic" },
  error: { color: colors.err, fontFamily: fonts.mono, fontSize: 12 },
});
