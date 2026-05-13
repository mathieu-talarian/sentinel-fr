import type { IconKeyT } from "@/components/atoms/Icons";
import type { TimelineToneT } from "@/components/molecules/CaseTimelineItem";
import type { CaseInspectorTabT } from "@/components/organisms/CaseInspector";
import type { ImportCaseResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { CaseTimelineItem } from "@/components/molecules/CaseTimelineItem";
import {
  importCaseQuoteListOptions,
  importCaseRiskScreenLatestOptions,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";

interface CaseTimelinePropsT {
  case_: ImportCaseResponseT;
  /** Jump to the matching inspector tab when a row is clicked. */
  onJumpToTab?: (tab: CaseInspectorTabT) => void;
}

interface TimelineEntryT {
  key: string;
  capturedAt: string;
  icon: IconKeyT;
  tone: TimelineToneT;
  label: string;
  detail?: string;
  tab?: CaseInspectorTabT;
}

const RISK_TONE: Record<string, TimelineToneT> = {
  clear: "ok",
  needsReview: "warn",
  incomplete: "info",
};

const RISK_LABEL: Record<string, string> = {
  clear: "Risk screen · clear",
  needsReview: "Risk screen · needs review",
  incomplete: "Risk screen · incomplete",
};

const RULING_TONE: Record<string, TimelineToneT> = {
  yes: "ok",
  no: "err",
  unknown: "info",
};

const COLLAPSED_LIMIT = 5;

const flagDetail = (count: number): string | undefined => {
  if (count === 0) return undefined;
  return count === 1 ? "1 flag" : `${count.toString()} flags`;
};

const pickJumpHandler = (
  tab: CaseInspectorTabT | undefined,
  onJumpToTab: ((tab: CaseInspectorTabT) => void) | undefined,
): (() => void) | undefined => {
  if (!tab || !onJumpToTab) return undefined;
  return () => {
    onJumpToTab(tab);
  };
};

/**
 * Chronological merge of the case's server-side events — quotes, risk
 * screens, ruling attachments. Rendered above the chat thread in
 * `CaseChatSurface` so the user can see what's happened to the case
 * alongside the active conversation. Chat messages themselves stay in
 * `ChatThread` rather than being interleaved — they don't carry
 * timestamps in the FE shape and live conversations are
 * already-temporal.
 */
export function CaseTimeline(props: Readonly<CaseTimelinePropsT>) {
  const { case_, onJumpToTab } = props;
  const [tweaks] = useTweaks();
  const [expanded, setExpanded] = useState(false);

  const quotesList = useQuery({
    ...importCaseQuoteListOptions({ path: { caseId: case_.id } }),
  });
  const riskLatest = useQuery({
    ...importCaseRiskScreenLatestOptions({ path: { caseId: case_.id } }),
    throwOnError: false,
  });

  const entries: TimelineEntryT[] = [];
  for (const q of quotesList.data?.quotes ?? []) {
    entries.push({
      key: `quote-${q.id}`,
      capturedAt: q.createdAt,
      icon: "Coin",
      tone: "neutral",
      label: "Quote captured",
      detail: formatUsd(q.summary.landedCostUsd),
      tab: "quote",
    });
  }
  if (riskLatest.data) {
    const status = riskLatest.data.status;
    entries.push({
      key: `risk-${riskLatest.data.id}`,
      capturedAt: riskLatest.data.createdAt,
      icon: "Shield",
      tone: RISK_TONE[status] ?? "info",
      label: RISK_LABEL[status] ?? `Risk screen · ${status}`,
      detail: flagDetail(riskLatest.data.flags.length),
      tab: "risks",
    });
  }
  for (const r of case_.rulings ?? []) {
    entries.push({
      key: `ruling-${r.rulingNumber}`,
      capturedAt: r.attachedAt,
      icon: "Scroll",
      tone: RULING_TONE[r.supportsSelectedCode] ?? "info",
      label: `Ruling ${r.rulingNumber} attached`,
      detail: r.subject ?? undefined,
      tab: "evidence",
    });
  }

  if (entries.length === 0) return null;

  const sorted = entries.toSorted((a, b) =>
    b.capturedAt.localeCompare(a.capturedAt),
  );
  const visible = expanded ? sorted : sorted.slice(0, COLLAPSED_LIMIT);
  const hidden = sorted.length - visible.length;

  return (
    <section {...sx(s.section)}>
      <header {...sx(s.head)}>
        <span {...sx(s.eyebrow)}>Activity</span>
        <span {...sx(s.count)}>{sorted.length}</span>
      </header>
      <div {...sx(s.list)}>
        {visible.map((e) => (
          <CaseTimelineItem
            key={e.key}
            icon={e.icon}
            tone={e.tone}
            label={e.label}
            detail={e.detail}
            capturedAt={e.capturedAt}
            lang={tweaks.lang}
            onClick={pickJumpHandler(e.tab, onJumpToTab)}
          />
        ))}
      </div>
      {hidden > 0 && (
        <button
          type="button"
          {...sx(s.more)}
          onClick={() => {
            setExpanded(true);
          }}
        >
          Show {hidden} more
        </button>
      )}
      {expanded && sorted.length > COLLAPSED_LIMIT && (
        <button
          type="button"
          {...sx(s.more)}
          onClick={() => {
            setExpanded(false);
          }}
        >
          Show less
        </button>
      )}
    </section>
  );
}

const s = stylex.create({
  section: {
    padding: "10px 12px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    backgroundColor: colors.paper2,
    display: "flex",
    flexDirection: "column",
  },
  head: {
    gap: 8,
    alignItems: "baseline",
    display: "flex",
    paddingLeft: 4,
  },
  eyebrow: {
    color: colors.ink4,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  count: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  list: {
    gap: 1,
    display: "flex",
    flexDirection: "column",
  },
  more: {
    margin: "2px 0 0",
    padding: "4px 10px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    alignSelf: "flex-start",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    color: colors.ink3,
    cursor: "pointer",
    fontFamily: fonts.sans,
    fontSize: 11.5,
  },
});
