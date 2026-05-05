import type { LocalizedDescription } from "@/lib/api/generated/types.gen";
import type { SearchCodesContentT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatHtsCode } from "@/lib/utils/format";

const localized = (
  d: LocalizedDescription,
  lang: "en" | "fr",
): string => d[lang] ?? d.en ?? d.fr ?? "";

const maxScore = (candidates: readonly { score: number }[]): number => {
  let max = 0;
  for (const c of candidates) {
    if (c.score > max) max = c.score;
  }
  return max || 1;
};

export function SearchResult(props: Readonly<{ result: SearchCodesContentT }>) {
  const [tweaks] = useTweaks();
  const candidates = props.result.candidates;
  const max = maxScore(candidates);
  const norm = (v: number) => Math.max(0, Math.min(1, v / max));

  return (
    <div>
      {candidates.map((cand) => {
        const isBest = cand.score === max;
        return (
          <div key={cand.code} {...sx(r.candidate, isBest && r.candidateBest)}>
            <div {...sx(r.row1)}>
              <span {...sx(r.code, isBest && r.codeBest)}>
                {formatHtsCode(cand.code)}
              </span>
              <span {...sx(r.score)}>
                {cand.score.toFixed(cand.score < 1 ? 3 : 2)}
              </span>
            </div>
            <div {...sx(r.bar)}>
              <div
                {...sx(r.barFill, isBest && r.barFillBest)}
                style={{ width: `${String(norm(cand.score) * 100)}%` }}
              />
            </div>
            <div {...sx(r.desc)}>{localized(cand.description, tweaks.lang)}</div>
          </div>
        );
      })}
    </div>
  );
}

const r = stylex.create({
  candidate: {
    padding: {
      default: "8px 0",
      ":first-child": "0 0 8px",
      ":last-child": "8px 0 0",
    },
    gap: 4,
    display: "flex",
    flexDirection: "column",
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: {
      default: borders.thin,
      ":last-child": "0",
    },
  },
  candidateBest: {},
  row1: { gap: 8, alignItems: "center", display: "flex" },
  code: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 13,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  codeBest: {
    padding: "1px 5px",
    borderRadius: 3,
    backgroundColor: colors.goldSoft,
    color: colors.goldDeep,
  },
  score: {
    color: colors.ink3,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginLeft: "auto",
  },
  bar: {
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: colors.paper3,
    height: 3,
  },
  barFill: { borderRadius: 2, backgroundColor: colors.ink3, height: "100%" },
  barFillBest: { backgroundColor: colors.gold },
  desc: { color: colors.ink3, fontSize: 12, lineHeight: 1.45 },
});
