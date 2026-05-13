import type {
  FeeScheduleRefViewT,
  LandedCostQuoteLineResponseT,
  LandedCostQuoteResponseT,
  QuoteSummaryT,
} from "@/lib/api/generated/types.gen";

export interface QuoteDeltaT {
  /** Selected minus latest, in USD (positive = selected is higher). */
  amountUsd: number;
  /** (selected - latest) / latest, in 0-1; `null` when latest is zero. */
  pct: number | null;
  direction: "up" | "down" | "flat";
}

const NEAR_ZERO = 0.005;

const directionOf = (amount: number): QuoteDeltaT["direction"] => {
  if (Math.abs(amount) < NEAR_ZERO) return "flat";
  return amount > 0 ? "up" : "down";
};

export const computeDelta = (selected: number, latest: number): QuoteDeltaT => {
  const amountUsd = selected - latest;
  const pct = latest === 0 ? null : amountUsd / latest;
  return { amountUsd, pct, direction: directionOf(amountUsd) };
};

export interface LinePairT {
  position: number;
  /** The selected (historical) quote's line, if it existed at that position. */
  selected: LandedCostQuoteLineResponseT | undefined;
  /** The latest quote's line, if it exists at that position. */
  latest: LandedCostQuoteLineResponseT | undefined;
}

/**
 * Pair lines from two quotes by `position`. When a position appears in
 * only one quote (line added or removed between captures), the missing
 * side is `undefined`. Result is sorted by position ascending so the
 * paired table reads in the same order as the case lines panel.
 */
export const pairLines = (
  selectedLines: readonly LandedCostQuoteLineResponseT[],
  latestLines: readonly LandedCostQuoteLineResponseT[],
): LinePairT[] => {
  const map = new Map<number, LinePairT>();
  for (const line of selectedLines) {
    map.set(line.position, {
      position: line.position,
      selected: line,
      latest: undefined,
    });
  }
  for (const line of latestLines) {
    const existing = map.get(line.position);
    if (existing) {
      existing.latest = line;
    } else {
      map.set(line.position, {
        position: line.position,
        selected: undefined,
        latest: line,
      });
    }
  }
  return [...map.values()].toSorted((a, b) => a.position - b.position);
};

export interface FeePairT {
  feeCode: string;
  selectedAmountUsd: number;
  latestAmountUsd: number;
  /** Schedule attribution; prefer the selected quote's, fall back to latest. */
  schedule: FeeScheduleRefViewT | undefined;
}

/**
 * Pair the entry fees (MPF + optional HMF) from two quote summaries.
 * Returns one row per visible fee, the same ones `QuoteEntryFees` would
 * have shown for the *selected* quote.
 */
export const pairEntryFees = (
  selectedQuote: LandedCostQuoteResponseT,
  latestSummary: QuoteSummaryT,
  latestRefs: readonly FeeScheduleRefViewT[],
  showHmf: boolean,
): FeePairT[] => {
  const pickRef = (feeCode: string): FeeScheduleRefViewT | undefined =>
    selectedQuote.feeScheduleRefs.find((f) => f.feeCode === feeCode) ??
    latestRefs.find((f) => f.feeCode === feeCode);

  const rows: FeePairT[] = [
    {
      feeCode: "mpf_formal",
      selectedAmountUsd: selectedQuote.summary.mpfUsd,
      latestAmountUsd: latestSummary.mpfUsd,
      schedule: pickRef("mpf_formal"),
    },
  ];
  if (showHmf) {
    rows.push({
      feeCode: "hmf_ocean",
      selectedAmountUsd: selectedQuote.summary.hmfUsd,
      latestAmountUsd: latestSummary.hmfUsd,
      schedule: pickRef("hmf_ocean"),
    });
  }
  return rows;
};
