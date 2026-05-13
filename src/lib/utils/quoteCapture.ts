import { formatRelativeDays } from "@/lib/utils/intl";

const ONE_DAY_MS = 86_400_000;

/**
 * "<relative-days> at <hh:mm>" — used by both the panel header and the
 * quote-history dropdown to label a captured-at timestamp. The relative
 * piece flips negative so e.g. "2 days ago" reads correctly for past
 * captures, then clamps at 0 (no "1 day in the future").
 */
export const formatCaptured = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  const relative = formatRelativeDays(-Math.max(days, 0), lang);
  const time = d.toLocaleTimeString(lang, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${relative} at ${time}`;
};
