import type { LandedCostContentT, LandedCostRowT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";

import { formatHtsCode } from "~/lib/format";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const sumRows = (rows: readonly LandedCostRowT[]) => {
  let total = 0;
  for (const r of rows) total += r.amount;
  return total;
};

const dutySubtitle = (r: LandedCostContentT) => {
  const parts: string[] = [];
  if (r.rate_text) parts.push(r.rate_text);
  if (r.code) parts.push(formatHtsCode(r.code));
  return parts.join(" · ") || undefined;
};

const buildRows = (r: LandedCostContentT): LandedCostRowT[] => {
  if (r.rows?.length) return r.rows;
  const out: LandedCostRowT[] = [];
  const declared = r.declared_value_usd ?? r.customs_value_usd;
  if (declared != null) {
    out.push({ label: "Customs value", amount: declared, sub: "declared FOB" });
  }
  if (r.duty_amount_usd != null) {
    out.push({
      label: "Duty",
      amount: r.duty_amount_usd,
      sub: dutySubtitle(r),
    });
  }
  if (r.mpf_usd != null) {
    out.push({ label: "MPF", amount: r.mpf_usd, sub: "0.3464%, capped" });
  }
  if (r.hmf_usd != null) {
    out.push({ label: "HMF", amount: r.hmf_usd, sub: "0.125%, ocean only" });
  }
  if (r.freight_usd != null && r.freight_usd > 0) {
    out.push({ label: "Freight", amount: r.freight_usd });
  }
  return out;
};

export function LandedCost(props: Readonly<{ result: LandedCostContentT }>) {
  const rows = () => buildRows(props.result);
  const total = () =>
    props.result.total ??
    props.result.landed_cost_usd ??
    sumRows(rows());

  return (
    <div>
      <table {...sx(lc.table)}>
        <tbody>
          <For each={rows()}>
            {(row) => (
              <tr>
                <td {...sx(lc.cell, lc.cellLeft)}>
                  {row.label}
                  <Show when={row.sub}>
                    {(sub) => <span {...sx(lc.sub)}>{sub()}</span>}
                  </Show>
                </td>
                <td {...sx(lc.cell, lc.cellRight)}>${fmt(row.amount)}</td>
              </tr>
            )}
          </For>
          <tr>
            <td {...sx(lc.cell, lc.totalLeft)}>Landed cost</td>
            <td {...sx(lc.cell, lc.totalRight)}>${fmt(total())}</td>
          </tr>
        </tbody>
      </table>
      <Show when={props.result.caveats?.length}>
        <div {...sx(lc.caveats)}>
          <div {...sx(lc.caveatsLabel)}>Caveats</div>
          <ul {...sx(lc.caveatsList)}>
            <For each={props.result.caveats}>
              {(item) => <li {...sx(lc.caveatsItem)}>{item}</li>}
            </For>
          </ul>
        </div>
      </Show>
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
    background: colors.paper2,
    padding: "8px 12px",
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
