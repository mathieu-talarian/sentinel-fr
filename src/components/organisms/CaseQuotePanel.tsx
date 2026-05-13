import type { ImportCaseT, LandedCostQuoteT } from "@/lib/types";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { CaveatsList } from "@/components/molecules/CaveatsList";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import { FeeRow } from "@/components/molecules/FeeRow";
import { QuoteLineRow } from "@/components/molecules/QuoteLineRow";
import { QuoteSummaryTable } from "@/components/molecules/QuoteSummaryTable";
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
import { formatRelativeDays } from "@/lib/utils/intl";

const ONE_DAY_MS = 86_400_000;

interface CaseQuotePanelPropsT {
  case_: ImportCaseT;
  isReadOnly: boolean;
}

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Couldn't run the quote.";
};

const formatCaptured = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  const relative = formatRelativeDays(-Math.max(days, 0), lang);
  const time = d.toLocaleTimeString(lang, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${relative} at ${time}`;
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

  const latestSummary = useMemo(() => {
    const items = quotesList.data?.quotes ?? [];
    if (items.length === 0) return undefined;
    return items.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  }, [quotesList.data?.quotes]);

  const latestId = latestSummary?.id ?? null;

  const latestQuote = useQuery({
    ...importCaseQuoteGetOptions({
      path: { caseId: case_.id, quoteId: latestId ?? "" },
    }),
    enabled: latestId !== null,
  });

  // Risk screen for the cost-estimate-only gate. 404 = "not run" — we
  // suppress the error and treat it as no data.
  const riskScreen = useQuery({
    ...importCaseRiskScreenLatestOptions({ path: { caseId: case_.id } }),
    throwOnError: false,
  });

  const runQuote = useMutation({
    ...importCaseQuoteCreateMutation(),
    onSuccess: async () => {
      setError(null);
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

  const quote: LandedCostQuoteT | undefined = latestQuote.data;
  const buttonLabel = pickButtonLabel(runQuote.isPending, quote != null);
  const screen = riskScreen.data;

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
        <>
          <QuoteSummaryTable summary={quote.summary} showHmf={showHmf} />

          <section {...sx(s.section)}>
            <h3 {...sx(s.sectionTitle)}>Lines</h3>
            <ul {...sx(s.list)}>
              {quote.lines
                .toSorted((a, b) => a.position - b.position)
                .map((line) => (
                  <QuoteLineRow key={line.id} line={line} lang={tweaks.lang} />
                ))}
            </ul>
          </section>

          <section {...sx(s.section)}>
            <h3 {...sx(s.sectionTitle)}>Entry fees</h3>
            <div {...sx(s.fees)}>
              <FeeRow
                feeCode="mpf_formal"
                amountUsd={quote.summary.mpfUsd}
                schedule={quote.feeScheduleRefs.find(
                  (f) => f.feeCode === "mpf_formal",
                )}
              />
              {showHmf && (
                <FeeRow
                  feeCode="hmf_ocean"
                  amountUsd={quote.summary.hmfUsd}
                  schedule={quote.feeScheduleRefs.find(
                    (f) => f.feeCode === "hmf_ocean",
                  )}
                />
              )}
            </div>
          </section>

          <CaveatsList caveats={quote.caveats} />
        </>
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
  section: { gap: 8, display: "flex", flexDirection: "column" },
  sectionTitle: {
    margin: 0,
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 6,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  fees: { gap: 8, display: "flex", flexDirection: "column" },
});
