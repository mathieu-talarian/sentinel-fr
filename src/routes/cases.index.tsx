/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import type { CaseStatusChipValueT } from "@/components/molecules/CaseStatusChip";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { CaseStatusChip } from "@/components/molecules/CaseStatusChip";
import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { Rail } from "@/components/organisms/Rail";
import { useCases, useSetActiveCase } from "@/lib/state/cases";
import { store } from "@/lib/state/store";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatMonthDay, formatRelativeDays } from "@/lib/utils/intl";

const ONE_DAY_MS = 86_400_000;

const STATUS_FILTERS = [
  "all",
  "draft",
  "ready_for_review",
  "archived",
] as const;
type StatusFilterT = (typeof STATUS_FILTERS)[number];

const CasesSearchSchema = z.object({
  status: z.enum(STATUS_FILTERS).optional(),
});

export const Route = createFileRoute("/cases/")({
  validateSearch: CasesSearchSchema,
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
  component: CasesIndexPage,
});

const formatWhen = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  if (days <= 1) return formatRelativeDays(-Math.max(days, 0), lang);
  return formatMonthDay(d, lang);
};

const KNOWN_STATUSES = new Set(["draft", "ready_for_review", "archived"]);
const asChipValue = (status: string): CaseStatusChipValueT =>
  KNOWN_STATUSES.has(status) ? (status as CaseStatusChipValueT) : "draft";

function CasesIndexPage() {
  const [tweaks] = useTweaks();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const cases = useCases();
  const setActive = useSetActiveCase();

  const filter: StatusFilterT = search.status ?? "all";
  const items = cases.data?.cases ?? [];
  const visible =
    filter === "all" ? items : items.filter((c) => c.status === filter);

  const onPick = (id: string) => {
    setActive(id);
    void navigate({ to: "/cases/$caseId", params: { caseId: id } });
  };

  const onNewCase = () => {
    void navigate({ to: "/cases/new" });
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
      <Rail onNewChat={() => undefined} onOpenSettings={() => undefined} />

      <main {...sx(s.main)}>
        <header {...sx(s.head)}>
          <Heading level="h1" size="md">
            Cases
          </Heading>
          <Button variant="primary" onClick={onNewCase}>
            New case
          </Button>
        </header>

        <div {...sx(s.filters)} role="tablist" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                {...sx(s.filter, active && s.filterActive)}
                onClick={() => {
                  void navigate({
                    to: "/cases",
                    search: () => (f === "all" ? {} : { status: f }),
                  });
                }}
              >
                {LABEL[f]}
              </button>
            );
          })}
        </div>

        {cases.isLoading && <div {...sx(s.note)}>Loading…</div>}
        {cases.isError && <div {...sx(s.error)}>Couldn't load cases.</div>}
        {!cases.isLoading && visible.length === 0 && (
          <div {...sx(s.note)}>
            {filter === "all"
              ? "Start by creating your first import case."
              : `No ${LABEL[filter].toLowerCase()} cases.`}
          </div>
        )}

        <ul {...sx(s.list)}>
          {visible.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                {...sx(s.row)}
                onClick={() => {
                  onPick(c.id);
                }}
              >
                <div {...sx(s.rowTitle)}>{c.title}</div>
                <div {...sx(s.rowMeta)}>
                  <CaseStatusChip status={asChipValue(c.status)} />
                  <span {...sx(s.when)}>
                    Updated {formatWhen(c.updatedAt, tweaks.lang)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </Sentry.ErrorBoundary>
  );
}

const LABEL: Record<StatusFilterT, string> = {
  all: "All",
  draft: "Draft",
  ready_for_review: "Ready for review",
  archived: "Archived",
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
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  filters: {
    gap: 4,
    alignItems: "center",
    display: "flex",
  },
  filter: {
    padding: "5px 10px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    color: colors.ink3,
    cursor: "pointer",
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: 500,
  },
  filterActive: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
    color: colors.ink,
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 6,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  row: {
    padding: "12px 14px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    transition: "background 120ms, border-color 120ms",
    backgroundColor: {
      default: colors.paper,
      ":hover": colors.paper2,
    },
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    width: "100%",
  },
  rowTitle: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: 500,
  },
  rowMeta: {
    gap: 10,
    alignItems: "center",
    display: "flex",
  },
  when: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
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
