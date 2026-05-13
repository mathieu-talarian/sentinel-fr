import type { CaseStatusChipValueT } from "@/components/molecules/CaseStatusChip";

import * as stylex from "@stylexjs/stylex";

import { CaseStatusChip } from "@/components/molecules/CaseStatusChip";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface RailCaseItemPropsT {
  title: string;
  when: string;
  status: CaseStatusChipValueT;
  /** Count of unclassified line items (Phase 11 surface). 0 hides the chip. */
  unclassifiedLineCount: number;
  active?: boolean;
  onClick?: () => void;
}

export function RailCaseItem(props: Readonly<RailCaseItemPropsT>) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      {...sx(s.row, props.active && s.rowActive)}
    >
      <span {...sx(s.headLine)}>
        <span {...sx(s.title, props.active && s.titleActive)}>
          {props.title}
        </span>
        {props.unclassifiedLineCount > 0 && (
          <span
            {...sx(s.unclassifiedChip)}
            aria-label={`${props.unclassifiedLineCount.toString()} unclassified lines`}
          >
            {props.unclassifiedLineCount}
          </span>
        )}
      </span>
      <span {...sx(s.meta)}>
        <CaseStatusChip status={props.status} />
        <span {...sx(s.when)}>{props.when}</span>
      </span>
    </button>
  );
}

const s = stylex.create({
  row: {
    padding: "8px 10px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 4,
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    fontFamily: fonts.sans,
    textAlign: "left",
    width: "100%",
  },
  rowActive: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
  },
  headLine: {
    gap: 6,
    alignItems: "center",
    display: "flex",
  },
  title: {
    flex: "1",
    overflow: "hidden",
    color: colors.ink2,
    fontSize: 13,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  titleActive: {
    color: colors.ink,
    fontWeight: 500,
  },
  meta: {
    gap: 6,
    alignItems: "center",
    display: "flex",
    justifyContent: "space-between",
  },
  when: {
    color: colors.ink4,
    fontSize: 11,
    fontVariantNumeric: "tabular-nums",
  },
  unclassifiedChip: {
    padding: "0 6px",
    borderRadius: radii.sm,
    backgroundColor: colors.warnSoft,
    color: colors.warn,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    lineHeight: 1.6,
  },
});
