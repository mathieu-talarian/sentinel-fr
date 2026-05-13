import type { LandedCostQuoteLineResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { HtsCodeBadge } from "@/components/molecules/HtsCodeBadge";
import { LineSurchargesList } from "@/components/molecules/LineSurchargesList";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";

interface QuoteLineRowPropsT {
  line: LandedCostQuoteLineResponseT;
  lang: "en" | "fr";
}

const formatQuantity = (
  qty: number,
  unit: string | null | undefined,
): string => (unit ? `${qty.toString()} ${unit}` : qty.toString());

/**
 * Expandable per-line breakdown inside the quote panel. Collapsed shows
 * a compact one-line summary (code, customs value, line total); expanded
 * reveals duty / surcharge math, country snapshot, qty/unit, caveats,
 * and the rate-source reference.
 */
export function QuoteLineRow(props: Readonly<QuoteLineRowPropsT>) {
  const { line, lang } = props;
  const [open, setOpen] = useState(false);

  return (
    <li {...sx(s.row, open && s.rowOpen)}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        {...sx(s.head)}
      >
        <span {...sx(s.position)}>#{line.position}</span>
        <HtsCodeBadge code={line.code} tone="selected" />
        <span {...sx(s.description)}>{line.description ?? ""}</span>
        <span {...sx(s.lineTotal)}>{formatUsd(line.lineTotalFeesUsd)}</span>
      </button>

      {open && (
        <div {...sx(s.body)}>
          <dl {...sx(s.kv)}>
            <KV label="Customs value" value={formatUsd(line.customsValueUsd)} />
            <KV label="Country of origin" value={line.countryOfOrigin} mono />
            {line.quantity != null && (
              <KV
                label="Quantity"
                value={formatQuantity(line.quantity, line.quantityUnit)}
                mono
              />
            )}
            <KV
              label="Duty (ad-valorem)"
              value={formatUsd(line.dutyAmountUsd)}
            />
            {line.dutySpecificAmountUsd > 0 && (
              <KV
                label="Duty (specific)"
                value={formatUsd(line.dutySpecificAmountUsd)}
              />
            )}
            <KV label="Surcharges" value={formatUsd(line.surchargeTotalUsd)} />
            {line.rateText && <KV label="Rate" value={line.rateText} mono />}
            {line.rateSourceCode && (
              <KV label="Rate source" value={line.rateSourceCode} mono />
            )}
          </dl>

          <section {...sx(s.section)}>
            <div {...sx(s.sectionLabel)}>Surcharge sources</div>
            <LineSurchargesList surcharges={line.surcharges} lang={lang} />
          </section>

          {line.caveats.length > 0 && (
            <div {...sx(s.caveats)}>
              <div {...sx(s.caveatsLabel)}>Line caveats</div>
              <ul {...sx(s.caveatsList)}>
                {line.caveats.map((c) => (
                  <li key={c} {...sx(s.caveatsItem)}>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function KV(props: Readonly<{ label: string; value: string; mono?: boolean }>) {
  return (
    <>
      <dt {...sx(s.kvLabel)}>{props.label}</dt>
      <dd {...sx(s.kvValue, props.mono && s.kvValueMono)}>{props.value}</dd>
    </>
  );
}

const s = stylex.create({
  row: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    backgroundColor: colors.paper,
  },
  rowOpen: { backgroundColor: colors.paper2 },
  head: {
    padding: "10px 12px",
    borderColor: "transparent",
    borderStyle: "none",
    borderWidth: 0,
    gap: 8,
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    cursor: "pointer",
    display: "flex",
    textAlign: "left",
    width: "100%",
  },
  position: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 500,
  },
  description: {
    flex: "1",
    overflow: "hidden",
    color: colors.ink2,
    fontSize: 12.5,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  lineTotal: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: 12.5,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
  },
  body: {
    padding: "10px 12px 12px",
    gap: 12,
    display: "flex",
    flexDirection: "column",
    borderTopColor: colors.line,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thin,
  },
  kv: {
    margin: 0,
    columnGap: 14,
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    rowGap: 4,
  },
  kvLabel: { color: colors.ink4, fontSize: 11.5 },
  kvValue: { color: colors.ink2, fontSize: 12 },
  kvValueMono: {
    fontFamily: fonts.mono,
    fontVariantNumeric: "tabular-nums",
  },
  section: { gap: 6, display: "flex", flexDirection: "column" },
  sectionLabel: {
    color: colors.ink4,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  caveats: {
    padding: "6px 10px",
    backgroundColor: colors.paper,
    borderLeftColor: colors.lineStrong,
    borderLeftStyle: borders.solid,
    borderLeftWidth: borders.bold,
  },
  caveatsLabel: {
    color: colors.ink4,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  caveatsList: { margin: 0, paddingLeft: 16 },
  caveatsItem: {
    margin: "2px 0",
    color: colors.ink3,
    fontSize: 11.5,
    fontStyle: "italic",
  },
});
