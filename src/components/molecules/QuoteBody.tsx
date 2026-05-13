import type { LandedCostQuoteResponseT } from "@/lib/api/generated/types.gen";

import { CaveatsList } from "@/components/molecules/CaveatsList";
import { QuoteDiffEntryFees } from "@/components/molecules/QuoteDiffEntryFees";
import { QuoteDiffLinesList } from "@/components/molecules/QuoteDiffLinesList";
import { QuoteDiffSummaryTable } from "@/components/molecules/QuoteDiffSummaryTable";
import { QuoteEntryFees } from "@/components/molecules/QuoteEntryFees";
import { QuoteLinesList } from "@/components/molecules/QuoteLinesList";
import { QuoteSummaryTable } from "@/components/molecules/QuoteSummaryTable";

interface QuoteBodyPropsT {
  selectedQuote: LandedCostQuoteResponseT;
  /** Latest quote — required (and used) only when `compareMode` is on. */
  latestQuote: LandedCostQuoteResponseT | null;
  compareMode: boolean;
  lang: "en" | "fr";
  showHmf: boolean;
}

/**
 * The renderable middle of `CaseQuotePanel`: summary table + lines +
 * entry fees + caveats. Picks the regular renderers or their paired-row
 * `QuoteDiff*` siblings based on `compareMode`. Caveats always come from
 * the selected quote — they're metadata about that capture.
 */
export function QuoteBody(props: Readonly<QuoteBodyPropsT>) {
  const { selectedQuote, latestQuote, compareMode, lang, showHmf } = props;
  const diff = compareMode && latestQuote !== null;

  return (
    <>
      {diff ? (
        <QuoteDiffSummaryTable
          selected={selectedQuote.summary}
          latest={latestQuote.summary}
          lang={lang}
          showHmf={showHmf}
        />
      ) : (
        <QuoteSummaryTable summary={selectedQuote.summary} showHmf={showHmf} />
      )}

      {diff ? (
        <QuoteDiffLinesList
          selectedLines={selectedQuote.lines}
          latestLines={latestQuote.lines}
          lang={lang}
        />
      ) : (
        <QuoteLinesList lines={selectedQuote.lines} lang={lang} />
      )}

      {diff ? (
        <QuoteDiffEntryFees
          selectedQuote={selectedQuote}
          latestSummary={latestQuote.summary}
          latestRefs={latestQuote.feeScheduleRefs}
          lang={lang}
          showHmf={showHmf}
        />
      ) : (
        <QuoteEntryFees
          summary={selectedQuote.summary}
          feeScheduleRefs={selectedQuote.feeScheduleRefs}
          showHmf={showHmf}
        />
      )}

      <CaveatsList caveats={selectedQuote.caveats} />
    </>
  );
}
