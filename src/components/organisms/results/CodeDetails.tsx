import type { LocalizedDescription } from "@/lib/api/generated/types.gen";
import type { CodeDetailsContentT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatHtsCode } from "@/lib/utils/format";

const localized = (
  d: LocalizedDescription | null | undefined,
  lang: "en" | "fr",
): string => d?.[lang] ?? d?.en ?? d?.fr ?? "";

export function CodeDetails(props: Readonly<{ result: CodeDetailsContentT }>) {
  const [tweaks] = useTweaks();
  const { code, description, hierarchy, rate, unit, section301 } = props.result;

  // Backend hierarchy is leaf-to-root; walk it in reverse for a top-down
  // breadcrumb. `toReversed()` returns a new array (immutable).
  const crumbs = hierarchy.toReversed();
  const lastIdx = crumbs.length - 1;

  return (
    <div>
      <div {...sx(d.crumb)}>
        {crumbs.map((seg, i) => (
          <span key={seg.code} style={{ display: "contents" }}>
            <span
              {...sx(d.crumbItem, i === lastIdx && d.crumbItemLast)}
              title={localized(seg.description, tweaks.lang)}
            >
              {formatHtsCode(seg.code)}
            </span>
            {i < lastIdx && <span {...sx(d.crumbSep)}>›</span>}
          </span>
        ))}
      </div>
      <div {...sx(d.codeLine)}>{formatHtsCode(code)}</div>
      <div {...sx(d.desc)}>{localized(description, tweaks.lang)}</div>
      <div {...sx(d.rateRow)}>
        <span {...sx(d.rateLabel)}>MFN duty</span>
        <span {...sx(d.rateVal)}>{rate.value ?? "—"}</span>
      </div>
      {unit && (
        <div {...sx(d.unit)}>
          unit: {unit}
          {section301 ? ` · ${section301}` : ""}
        </div>
      )}
    </div>
  );
}

const d = stylex.create({
  crumb: {
    gap: "4px 6px",
    color: colors.ink3,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: fonts.mono,
    fontSize: 11,
    marginBottom: 8,
  },
  crumbItem: { whiteSpace: "nowrap" },
  crumbItemLast: { color: colors.ink, fontWeight: 600 },
  crumbSep: { color: colors.ink5 },
  codeLine: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    marginBottom: 4,
  },
  desc: {
    color: colors.ink2,
    fontSize: 13,
    lineHeight: 1.45,
    marginBottom: 8,
  },
  rateRow: {
    gap: 8,
    alignItems: "baseline",
    display: "flex",
    marginTop: 4,
  },
  rateLabel: {
    color: colors.ink4,
    fontSize: 11.5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  rateVal: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: 600,
  },
  unit: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 6,
  },
});
