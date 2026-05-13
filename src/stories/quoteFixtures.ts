import type {
  AppliedSurchargeT,
  FeeScheduleRefViewT,
  LandedCostQuoteLineResponseT,
  LandedCostQuoteResponseT,
  QuoteSummaryT,
} from "@/lib/api/generated/types.gen";

/**
 * Typed fixtures shared by the quote-family stories. Each factory takes
 * an optional `Partial<T>` override so stories can express variation with
 * a single spread.
 */

export const sampleSummary = (
  over: Partial<QuoteSummaryT> = {},
): QuoteSummaryT => ({
  declaredTotalUsd: 12_000,
  dutyTotalUsd: 1_980,
  freightUsd: 1_200,
  hmfUsd: 15.4,
  insuranceUsd: 60,
  landedCostUsd: 15_307.7,
  mpfUsd: 27.75,
  surchargeTotalUsd: 24.55,
  totalFeesUsd: 2_047.7,
  ...over,
});

export const sampleFeeRefs: FeeScheduleRefViewT[] = [
  {
    feeCode: "mpf_formal",
    effectiveFrom: "2026-01-01",
    sourceUrl: "https://www.cbp.gov/trade/programs-administration/cofo/mpf",
  },
  {
    feeCode: "hmf_ocean",
    effectiveFrom: "2025-04-15",
    sourceUrl: "https://www.cbp.gov/trade/hmf",
  },
];

export const sampleSurcharge = (
  over: Partial<AppliedSurchargeT> = {},
): AppliedSurchargeT => ({
  rule_id: "rule-1",
  program: "Section 301 List 4A",
  basis: "ad_valorem",
  chapter_99_code: "9903.88.15",
  rate_pct: 0.075,
  rate_text: null,
  effective_from: "2024-05-01",
  effective_to: null,
  source_url: "https://ustr.gov/section-301",
  source_notice: "USTR notice",
  specific_per_unit_usd: null,
  specific_unit: null,
  amount_usd: 24.55,
  ...over,
});

export const sampleQuoteLine = (
  over: Partial<LandedCostQuoteLineResponseT> = {},
): LandedCostQuoteLineResponseT => ({
  id: "line-1",
  position: 1,
  code: "6109100011",
  description: "Cotton t-shirt, men's, knit",
  countryOfOrigin: "VN",
  customsValueUsd: 4_200,
  dutyAmountUsd: 693,
  dutySpecificAmountUsd: 0,
  surchargeTotalUsd: 0,
  surcharges: [],
  caveats: [],
  rateText: "16.5%",
  rateSourceCode: "USITC HTS chapter 61 §6109",
  lineTotalFeesUsd: 693,
  quantity: 1200,
  quantityUnit: "EA",
  caseLineItemId: "case-line-1",
  ...over,
});

const lineA = sampleQuoteLine({
  surcharges: [sampleSurcharge()],
  surchargeTotalUsd: 24.55,
  lineTotalFeesUsd: 717.55,
  caveats: ["Section 301 surcharge included."],
});

const lineB = sampleQuoteLine({
  id: "line-2",
  position: 2,
  code: "6203425010",
  description: "Cotton trousers, men's",
  countryOfOrigin: "VN",
  customsValueUsd: 6_300,
  dutyAmountUsd: 1_045,
  lineTotalFeesUsd: 1_045,
  rateText: "16.6%",
  rateSourceCode: "USITC HTS chapter 62 §6203",
  caseLineItemId: "case-line-2",
});

const lineC = sampleQuoteLine({
  id: "line-3",
  position: 3,
  code: "6204628060",
  description: "Cotton trousers, women's",
  countryOfOrigin: "VN",
  customsValueUsd: 1_500,
  dutyAmountUsd: 249,
  lineTotalFeesUsd: 249,
  rateText: "16.6%",
  rateSourceCode: "USITC HTS chapter 62 §6204",
  caseLineItemId: "case-line-3",
});

export const sampleLines: LandedCostQuoteLineResponseT[] = [lineA, lineB, lineC];

export const sampleQuote = (
  over: Partial<LandedCostQuoteResponseT> = {},
): LandedCostQuoteResponseT => ({
  id: "quote-3",
  caseId: "case-1",
  currency: "USD",
  transport: "ocean",
  referenceDate: "2026-05-12",
  createdAt: "2026-05-12T14:18:00Z",
  countryOfOrigin: "VN",
  summary: sampleSummary(),
  lines: sampleLines,
  feeScheduleRefs: sampleFeeRefs,
  caveats: [
    "Rate excludes Section 301 China duties unless a chapter-99 rule matched.",
    "MPF/HMF assumed at default thresholds — confirm with broker.",
  ],
  ...over,
});

/**
 * A second snapshot used by the diff stories. Slight bump in duty + a
 * dropped line so the diff demos exercise added/removed cells too.
 */
export const sampleQuoteOlder = (
  over: Partial<LandedCostQuoteResponseT> = {},
): LandedCostQuoteResponseT => ({
  ...sampleQuote(),
  id: "quote-2",
  createdAt: "2026-04-29T09:02:00Z",
  referenceDate: "2026-04-29",
  summary: sampleSummary({
    dutyTotalUsd: 1_900,
    landedCostUsd: 15_200,
    surchargeTotalUsd: 18,
  }),
  lines: [
    sampleQuoteLine({
      surcharges: [sampleSurcharge({ amount_usd: 18, rate_pct: 0.055 })],
      surchargeTotalUsd: 18,
      lineTotalFeesUsd: 711,
    }),
    lineB,
  ],
  ...over,
});
