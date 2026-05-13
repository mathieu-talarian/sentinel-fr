import type { CaseStatusChipValueT } from "@/components/molecules/CaseStatusChip";

import * as stylex from "@stylexjs/stylex";
import { useNavigate } from "@tanstack/react-router";

import { RailCaseItem } from "@/components/molecules/RailCaseItem";
import { useActiveCaseId, useCases, useSetActiveCase } from "@/lib/state/cases";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatMonthDay, formatRelativeDays } from "@/lib/utils/intl";

const ONE_DAY_MS = 86_400_000;

const formatWhen = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  if (days <= 1) return formatRelativeDays(-Math.max(days, 0), lang);
  return formatMonthDay(d, lang);
};

const KNOWN_STATUSES = new Set(["draft", "ready_for_review", "archived"]);

const asChipValue = (status: string): CaseStatusChipValueT =>
  KNOWN_STATUSES.has(status) ? (status as CaseStatusChipValueT) : "draft";

/**
 * Rail listing of the user's import cases — shipped under the Phase 3
 * flag. Replaces `RailHistoryList` when `caseWorkbench` is on.
 *
 * The list is intentionally unfiltered here; the `/cases` index page
 * owns the status-filter UI. Both views share the same TanStack Query
 * cache so toggling between them is instant.
 */
export function RailCaseList() {
  const [tweaks] = useTweaks();
  const cases = useCases();
  const activeId = useActiveCaseId();
  const setActive = useSetActiveCase();
  const navigate = useNavigate();
  const items = cases.data?.cases ?? [];

  const onPick = (id: string) => {
    setActive(id);
    void navigate({ to: "/cases/$caseId", params: { caseId: id } });
  };

  return (
    <>
      <div {...sx(s.section)}>Cases</div>
      <div {...sx(s.list)}>
        {items.length === 0 && !cases.isLoading && (
          <div {...sx(s.empty)}>No cases yet.</div>
        )}
        {items.map((c) => (
          <RailCaseItem
            key={c.id}
            title={c.title}
            status={asChipValue(c.status)}
            when={formatWhen(c.updatedAt, tweaks.lang)}
            active={c.id === activeId}
            onClick={() => {
              onPick(c.id);
            }}
          />
        ))}
        {cases.isError && <div {...sx(s.error)}>Couldn't load cases</div>}
      </div>
    </>
  );
}

const s = stylex.create({
  section: {
    padding: "14px 14px 4px",
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  list: {
    padding: "0 6px 12px",
    flex: "1",
    gap: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  empty: {
    padding: "8px 10px",
    color: colors.ink4,
    fontSize: 12,
    fontStyle: "italic",
  },
  error: {
    padding: "8px 10px",
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
