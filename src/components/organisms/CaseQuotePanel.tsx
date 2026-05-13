import type {
  ImportCaseResponseT,
  LandedCostQuoteResponseT,
} from "@/lib/api/generated/types.gen";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import { HistoricalQuoteBanner } from "@/components/molecules/HistoricalQuoteBanner";
import { QuoteBody } from "@/components/molecules/QuoteBody";
import { QuoteHistoryDropdown } from "@/components/molecules/QuoteHistoryDropdown";
import {
  importCaseGetQueryKey,
  importCaseQuoteCreateMutation,
  importCaseQuoteGetOptions,
  importCaseQuoteListOptions,
  importCaseQuoteListQueryKey,
  importCaseRiskScreenLatestOptions,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { selectCaseStatus } from "@/lib/state/caseStatus";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatCaptured } from "@/lib/utils/quoteCapture";

interface CaseQuotePanelPropsT {
  case_: ImportCaseResponseT;
  isReadOnly: boolean;
}

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Couldn't run the quote.";
};

const pickButtonLabel = (busy: boolean, hasQuote: boolean): string => {
  if (busy) return "Running…";
  if (hasQuote) return "Re-run quote";
  return "Run quote";
};

export function CaseQuotePanel(props: Readonly<CaseQuotePanelPropsT>) {
  const { case_, isReadOnly } = props;
  const [tweaks] = useTweaks();
  const [error, setError] = useState<string | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);

  const queryClient = useQueryClient();
  const status = selectCaseStatus(case_);
  const canQuote =
    status === "readyForQuote" ||
    status === "quoted" ||
    status === "needsReview" ||
    status === "readyForBroker";
  const showHmf = case_.transport === "ocean";

  const quotesList = useQuery({
    ...importCaseQuoteListOptions({ path: { caseId: case_.id } }),
  });

  const orderedQuotes = useMemo(() => {
    const items = quotesList.data?.quotes ?? [];
    return items.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [quotesList.data?.quotes]);

  const latestSummary = orderedQuotes.at(0);
  const activeId =
    selectedQuoteId && orderedQuotes.some((q) => q.id === selectedQuoteId)
      ? selectedQuoteId
      : (latestSummary?.id ?? null);
  const isHistorical = activeId != null && activeId !== latestSummary?.id;

  const selectedQuoteQ = useQuery({
    ...importCaseQuoteGetOptions({
      path: { caseId: case_.id, quoteId: activeId ?? "" },
    }),
    enabled: activeId !== null,
  });

  // When compare mode is on AND we're viewing a historical snapshot,
  // fetch the latest quote alongside the selected one. Same query as
  // the regular `latestQuote` path; React Query dedupes by key when both
  // ids happen to coincide, but `isHistorical` already gates that out.
  const latestQuoteQ = useQuery({
    ...importCaseQuoteGetOptions({
      path: { caseId: case_.id, quoteId: latestSummary?.id ?? "" },
    }),
    enabled:
      compareMode && isHistorical && (latestSummary?.id ?? null) !== null,
  });

  // Risk screen for the cost-estimate-only gate. 404 = "not run" — we
  // suppress the error and treat it as no data.
  const riskScreen = useQuery({
    ...importCaseRiskScreenLatestOptions({ path: { caseId: case_.id } }),
    throwOnError: false,
  });

  const runQuote = useMutation({
    ...importCaseQuoteCreateMutation(),
    meta: { tags: { "import_case.id": case_.id } },
    onSuccess: async () => {
      setError(null);
      setSelectedQuoteId(null);
      setCompareMode(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: importCaseQuoteListQueryKey({
            path: { caseId: case_.id },
          }),
        }),
        // Case detail carries `lastQuotedAt`, which drives `selectCaseStatus`.
        queryClient.invalidateQueries({
          queryKey: importCaseGetQueryKey({ path: { caseId: case_.id } }),
        }),
      ]);
    },
    onError: (e) => {
      const msg = errorMessage(e);
      Sentry.addBreadcrumb({
        category: "quote",
        level: "warning",
        message: "run-quote failed",
        data: { detail: msg },
      });
      setError(msg);
    },
  });

  const onRunQuote = () => {
    setError(null);
    runQuote.mutate({ body: {}, path: { caseId: case_.id } });
  };

  const quote: LandedCostQuoteResponseT | undefined = selectedQuoteQ.data;
  const latestQuoteData = latestQuoteQ.data ?? null;
  const buttonLabel = pickButtonLabel(runQuote.isPending, quote != null);
  const screen = riskScreen.data;

  // Auto-flip out of compare mode if the user navigates back to "Latest"
  // — there's nothing to compare against. Keeping it on would render
  // identical Selected / Latest columns with all-zero Δ rows.
  const effectiveCompareMode = compareMode && isHistorical;

  // Cost-estimate-only banner. Per the FE doc, the quote should never read
  // as "complete" until the risk screen has run on the current quote (a
  // screen older than the quote is also stale). Phase 7 minimum: only
  // suppress the banner when the risk screen exists AND ran at or after
  // the quote's `createdAt`. Status `incomplete` keeps the banner.
  const screenSettlesQuote =
    quote != null &&
    screen != null &&
    screen.status !== "incomplete" &&
    screen.createdAt >= quote.createdAt;

  return (
    <div {...sx(s.panel)}>
      <header {...sx(s.head)}>
        <div {...sx(s.headText)}>
          <span {...sx(s.eyebrow)}>Landed cost</span>
          {quote ? (
            <span {...sx(s.captured)}>
              Captured {formatCaptured(quote.createdAt, tweaks.lang)} ·
              immutable snapshot
            </span>
          ) : (
            <span {...sx(s.capturedMuted)}>No quote yet.</span>
          )}
        </div>
        <Button
          variant="primary"
          onClick={onRunQuote}
          disabled={isReadOnly || runQuote.isPending || !canQuote}
        >
          {buttonLabel}
        </Button>
      </header>

      {orderedQuotes.length > 1 && (
        <QuoteHistoryDropdown
          quotes={orderedQuotes}
          activeId={activeId}
          labelFor={(q) => formatCaptured(q.createdAt, tweaks.lang)}
          onSelect={(next) => {
            setSelectedQuoteId(next === latestSummary?.id ? null : next);
          }}
        />
      )}

      {isHistorical && (
        <HistoricalQuoteBanner
          compareMode={compareMode}
          onCompareModeChange={setCompareMode}
        />
      )}

      {!canQuote && !quote && (
        <p {...sx(s.gate)}>
          Fill in the missing case facts and pick a selected HTS code for every
          line item to enable the quote.
        </p>
      )}

      {error && <ErrorBanner message={error} />}

      {quote && !screenSettlesQuote && (
        <p {...sx(s.gate)}>
          {screen?.status === "needsReview"
            ? "Cost estimate only — the risk screen flagged items that may change the final amount due at entry."
            : "Cost estimate only — run the risk screen to confirm trade-remedy and compliance exposure before broker handoff."}
        </p>
      )}

      {quote && (
        <QuoteBody
          selectedQuote={quote}
          latestQuote={effectiveCompareMode ? latestQuoteData : null}
          compareMode={effectiveCompareMode}
          lang={tweaks.lang}
          showHmf={showHmf}
        />
      )}
    </div>
  );
}

const s = stylex.create({
  panel: { gap: 14, display: "flex", flexDirection: "column" },
  head: {
    gap: 12,
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
  },
  headText: { gap: 2, display: "flex", flexDirection: "column" },
  eyebrow: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  captured: { color: colors.ink3, fontFamily: fonts.mono, fontSize: 11.5 },
  capturedMuted: { color: colors.ink4, fontSize: 12, fontStyle: "italic" },
  gate: {
    margin: 0,
    padding: "8px 10px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: "dashed",
    borderWidth: borders.thin,
    backgroundColor: colors.paper2,
    color: colors.ink3,
    fontSize: 12,
  },
});
