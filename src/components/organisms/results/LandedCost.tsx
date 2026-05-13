import type {
  AppliedSurchargeT,
  LandedCostResponseT,
} from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { SourceLink } from "@/components/molecules/SourceLink";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatPercent, formatUsd } from "@/lib/utils/intl";

// Verbatim from FRONTEND_IMPORT_CASE_WORKBENCH.md §Quote Panel — must not be
// softened to "no surcharge applies". The wording distinguishes "we ran the
// rules and nothing matched" from "the rules don't apply here".
const NO_SURCHARGE_RULE = "No verified surcharge rule matched this case.";

const formatRate = (s: AppliedSurchargeT, lang: "en" | "fr"): string | null => {
  if (s.rate_text) return s.rate_text;
  if (s.rate_pct != null) return formatPercent(s.rate_pct, lang);
  if (s.specific_per_unit_usd != null && s.specific_unit) {
    return `${formatUsd(s.specific_per_unit_usd)}/${s.specific_unit}`;
  }
  return null;
};

const sourceLabel = (s: AppliedSurchargeT): string =>
  s.source_notice ?? `${s.program} notice`;

function SurchargeRow(
  props: Readonly<{ surcharge: AppliedSurchargeT; lang: "en" | "fr" }>,
) {
  const { surcharge, lang } = props;
  const rate = formatRate(surcharge, lang);
  return (
    <li {...sx(lc.surchargeRow)}>
      <div {...sx(lc.surchargeHead)}>
        <span {...sx(lc.surchargeProgram)}>{surcharge.program}</span>
        {surcharge.chapter_99_code && (
          <span {...sx(lc.chapter99)}>{surcharge.chapter_99_code}</span>
        )}
        {rate && <span {...sx(lc.surchargeRate)}>{rate}</span>}
      </div>
      {surcharge.source_url && (
        <SourceLink
          label={sourceLabel(surcharge)}
          url={surcharge.source_url}
          effectiveDate={surcharge.effective_from}
        />
      )}
      {!surcharge.source_url && (
        <span {...sx(lc.effectiveOnly)}>
          effective {surcharge.effective_from}
        </span>
      )}
    </li>
  );
}

export function LandedCost(props: Readonly<{ result: LandedCostResponseT }>) {
  const [tweaks] = useTweaks();
  const { rows, total, caveats, surcharges } = props.result;

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
              <td {...sx(lc.cell, lc.cellRight)}>{formatUsd(row.amount)}</td>
            </tr>
          ))}
          <tr>
            <td {...sx(lc.cell, lc.totalLeft)}>Landed cost</td>
            <td {...sx(lc.cell, lc.totalRight)}>{formatUsd(total)}</td>
          </tr>
        </tbody>
      </table>

      {surcharges.length > 0 ? (
        <section {...sx(lc.surcharges)}>
          <div {...sx(lc.sectionLabel)}>Surcharge sources</div>
          <ul {...sx(lc.surchargeList)}>
            {surcharges.map((s) => (
              <SurchargeRow key={s.rule_id} surcharge={s} lang={tweaks.lang} />
            ))}
          </ul>
        </section>
      ) : (
        <p {...sx(lc.noSurcharge)}>{NO_SURCHARGE_RULE}</p>
      )}

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
  surcharges: {
    padding: "10px 12px",
    backgroundColor: colors.paper2,
    borderBottomLeftRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    marginTop: 12,
  },
  sectionLabel: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  surchargeList: {
    margin: 0,
    padding: 0,
    gap: 8,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  surchargeRow: {
    gap: 2,
    display: "flex",
    flexDirection: "column",
  },
  surchargeHead: {
    gap: 6,
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
  },
  surchargeProgram: {
    color: colors.ink2,
    fontSize: 12.5,
    fontWeight: 600,
  },
  surchargeRate: {
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontVariantNumeric: "tabular-nums",
    marginLeft: "auto",
  },
  chapter99: {
    padding: "1px 5px",
    borderRadius: 3,
    backgroundColor: colors.paper3,
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontWeight: 600,
  },
  effectiveOnly: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10.5,
  },
  noSurcharge: {
    margin: "12px 0 0",
    color: colors.ink4,
    fontSize: 11.5,
    fontStyle: "italic",
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
