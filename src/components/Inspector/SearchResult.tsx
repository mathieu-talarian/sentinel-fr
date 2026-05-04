import type { SearchCandidateT, SearchCodesContentT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For } from "solid-js";

import { formatHtsCode } from "~/lib/format";
import { sx } from "~/lib/sx";
import { borders, colors, fonts } from "~/lib/tokens.stylex";

const scoreOf = (c: SearchCandidateT) => c.fused_score ?? c.score ?? 0;

const maxScore = (candidates: readonly SearchCandidateT[]) => {
  let max = 0;
  for (const c of candidates) {
    const v = scoreOf(c);
    if (v > max) max = v;
  }
  return max || 1;
};

export function SearchResult(
  props: Readonly<{ result: SearchCodesContentT }>,
) {
  const candidates = () => props.result.candidates;
  const max = () => maxScore(candidates());
  const norm = (v: number) => Math.max(0, Math.min(1, v / max()));

  return (
    <div>
      <For each={candidates()}>
        {(cand) => {
          const score = scoreOf(cand);
          const isBest = score === max();
          return (
            <div {...sx(r.candidate, isBest && r.candidateBest)}>
              <div {...sx(r.row1)}>
                <span {...sx(r.code, isBest && r.codeBest)}>
                  {formatHtsCode(cand.code)}
                </span>
                <span {...sx(r.score)}>{score.toFixed(score < 1 ? 3 : 2)}</span>
              </div>
              <div {...sx(r.bar)}>
                <div
                  {...sx(r.barFill, isBest && r.barFillBest)}
                  style={{ width: `${String(norm(score) * 100)}%` }}
                />
              </div>
              <div {...sx(r.desc)}>{cand.desc_en ?? cand.desc ?? ""}</div>
            </div>
          );
        }}
      </For>
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
    background: colors.goldSoft,
    padding: "1px 5px",
    borderRadius: 3,
    color: colors.goldDeep,
  },
  score: {
    color: colors.ink3,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginLeft: "auto",
  },
  bar: {
    background: colors.paper3,
    borderRadius: 2,
    overflow: "hidden",
    height: 3,
  },
  barFill: { background: colors.ink3, borderRadius: 2, height: "100%" },
  barFillBest: { background: colors.gold },
  desc: { color: colors.ink3, fontSize: 12, lineHeight: 1.45 },
});
