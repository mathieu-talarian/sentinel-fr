/**
 * Cached `Intl.*` formatters.
 *
 * Constructing `Intl.NumberFormat` / `Intl.DateTimeFormat` /
 * `Intl.RelativeTimeFormat` isn't free (each instance reads ICU locale data),
 * so we memoize by `(locale, options)` at module scope. The cache is keyed
 * by a deterministic string so two callers with the same shape share one
 * formatter for the lifetime of the tab.
 *
 * USD currency is intentionally locked to `en-US`: the audience is U.S.
 * import filings and brokers expect `$20,000.00`, not `20 000,00 $US`. The
 * other helpers honour `tweaks.lang` so numbers, percents, seconds, and
 * relative dates follow the UI locale.
 */

type LangT = "en" | "fr";

const numberCache = new Map<string, Intl.NumberFormat>();
const dateCache = new Map<string, Intl.DateTimeFormat>();
const relativeCache = new Map<string, Intl.RelativeTimeFormat>();

const numberFormatter = (
  key: string,
  locale: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat => {
  let f = numberCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, options);
    numberCache.set(key, f);
  }
  return f;
};

const dateFormatter = (
  key: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat => {
  let f = dateCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    dateCache.set(key, f);
  }
  return f;
};

const relativeFormatter = (locale: string): Intl.RelativeTimeFormat => {
  let f = relativeCache.get(locale);
  if (!f) {
    f = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    relativeCache.set(locale, f);
  }
  return f;
};

/**
 * `$20,000.00` — always `en-US`, always USD. Use this anywhere we render a
 * landed-cost amount, fee, or duty figure. The prefix `$` is part of the
 * Intl output, so JSX should NOT add its own `$`.
 */
export const formatUsd = (n: number): string =>
  numberFormatter("usd", "en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);

/** Locale-grouped integer, e.g. `1,234` (en) or `1 234` (fr). */
export const formatInteger = (n: number, lang: LangT): string =>
  numberFormatter(`int|${lang}`, lang, {}).format(n);

/**
 * Percent from a fraction. Pass `0.165` to render `16.50 %` (fr) or
 * `16.50%` (en). `fractionDigits` controls both min and max.
 */
export const formatPercent = (
  fraction: number,
  lang: LangT,
  fractionDigits = 2,
): string =>
  numberFormatter(`pct|${lang}|${fractionDigits.toString()}`, lang, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(fraction);

/** `1.2s` / `1,2 s` — narrow second unit, one fractional digit. */
export const formatSeconds = (seconds: number, lang: LangT): string =>
  numberFormatter(`sec|${lang}`, lang, {
    style: "unit",
    unit: "second",
    unitDisplay: "narrow",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(seconds);

/** `Mar 5` (en) / `5 mars` (fr). */
export const formatMonthDay = (date: Date, lang: LangT): string =>
  dateFormatter(`md|${lang}`, lang, {
    month: "short",
    day: "numeric",
  }).format(date);

/**
 * `today`/`yesterday`/`2 days ago` for the given day delta. The argument is
 * the signed delta from now: `0` = today, `-1` = yesterday. `numeric:"auto"`
 * picks the natural-language form ("today" rather than "0 days ago") when
 * available.
 */
export const formatRelativeDays = (daysFromNow: number, lang: LangT): string =>
  relativeFormatter(lang).format(daysFromNow, "day");
