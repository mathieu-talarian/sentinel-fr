import type { LandedCostContentT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function LandedCost(props: Readonly<{ result: LandedCostContentT }>) {
  const { rows, total, caveats } = props.result;

  return (
    <div>
      <table {...sx(lc.table)}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td {...sx(lc.cell, lc.cellLeft)}>
                {row.label}
                {row.sub && <span {...sx(lc.sub)}>{row.sub}</span>}
              </td>
              <td {...sx(lc.cell, lc.cellRight)}>${fmt(row.amount)}</td>
            </tr>
          ))}
          <tr>
            <td {...sx(lc.cell, lc.totalLeft)}>Landed cost</td>
            <td {...sx(lc.cell, lc.totalRight)}>${fmt(total)}</td>
          </tr>
        </tbody>
      </table>
      {caveats.length > 0 && (
        <div {...sx(lc.caveats)}>
          <div {...sx(lc.caveatsLabel)}>Caveats</div>
          <ul {...sx(lc.caveatsList)}>
            {caveats.map((item) => (
              <li key={item} {...sx(lc.caveatsItem)}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const lc = stylex.create({
  table: { borderCollapse: "collapse", fontSize: 12.5, width: "100%" },
  cell: {
    padding: "7px 0",
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
  },
  cellLeft: {},
  cellRight: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
  totalLeft: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: 600,
    borderBottomStyle: "none",
    borderBottomWidth: 0,
    borderTopColor: colors.ink,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thick,
    paddingTop: 9,
  },
  totalRight: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    textAlign: "right",
    borderBottomStyle: "none",
    borderBottomWidth: 0,
    borderTopColor: colors.ink,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thick,
    paddingTop: 9,
  },
  sub: {
    color: colors.ink4,
    display: "block",
    fontFamily: fonts.mono,
    fontSize: 10.5,
    marginTop: 1,
  },
  caveats: {
    padding: "8px 12px",
    backgroundColor: colors.paper2,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: radii.sm,
    borderLeftColor: colors.lineStrong,
    borderLeftStyle: borders.solid,
    borderLeftWidth: borders.bold,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radii.sm,
    marginTop: 12,
  },
  caveatsLabel: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  caveatsList: { margin: 0, paddingLeft: 18 },
  caveatsItem: {
    margin: "2px 0",
    color: colors.ink3,
    fontSize: 12.5,
    fontStyle: "italic",
  },
});
