import type { CrossRulingsContentT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";

export function Rulings(props: Readonly<{ result: CrossRulingsContentT }>) {
  return (
    <div>
      {props.result.rulings.map((rg) => (
        <div key={rg.num} {...sx(rl.ruling)}>
          <div {...sx(rl.row1)}>
            <span {...sx(rl.num)}>{rg.num}</span>
            <span {...sx(rl.date)}>{rg.date}</span>
          </div>
          <div {...sx(rl.subj)}>{rg.subject}</div>
          <div {...sx(rl.codes)}>
            {rg.codes.map((code) => (
              <span key={code} {...sx(rl.code)}>
                {code}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const rl = stylex.create({
  ruling: {
    padding: {
      default: "10px 0",
      ":first-child": "0 0 10px",
      ":last-child": "10px 0 0",
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
  row1: { gap: 8, alignItems: "center", display: "flex" },
  num: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontWeight: 600,
  },
  date: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginLeft: "auto",
  },
  subj: { color: colors.ink2, fontSize: 12.5, lineHeight: 1.4 },
  codes: { gap: 4, display: "flex", flexWrap: "wrap", marginTop: 2 },
  code: {
    padding: "1px 5px",
    borderRadius: 3,
    backgroundColor: colors.paper3,
    color: colors.ink2,
    fontFamily: fonts.serif,
    fontSize: 10.5,
    fontWeight: 600,
  },
  codeOk: { backgroundColor: colors.okSoft, color: colors.ok },
  codeWarn: { backgroundColor: colors.warnSoft, color: colors.warn },
});
