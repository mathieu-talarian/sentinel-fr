import type { CaseStatusChipValueT } from "@/components/molecules/CaseStatusChip";

import * as stylex from "@stylexjs/stylex";

import { CaseStatusChip } from "@/components/molecules/CaseStatusChip";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface CaseIndexRowPropsT {
  title: string;
  status: CaseStatusChipValueT;
  unclassifiedLineCount: number;
  /** Pre-formatted "Updated <when>" / "<when>" string. */
  when: string;
  onClick: () => void;
}

/**
 * One row in `/cases` index list. The unclassified-count chip is a
 * read-only indicator; the per-case bulk-classify button lives inside
 * the workbench (`CaseLinesPanel`) where line management lives, so this
 * stays a single click to open the case.
 */
export function CaseIndexRow(props: Readonly<CaseIndexRowPropsT>) {
  return (
    <button type="button" {...sx(s.row)} onClick={props.onClick}>
      <div {...sx(s.title)}>{props.title}</div>
      <div {...sx(s.meta)}>
        <CaseStatusChip status={props.status} />
        {props.unclassifiedLineCount > 0 && (
          <span {...sx(s.unclassifiedChip)}>
            {props.unclassifiedLineCount} unclassified
          </span>
        )}
        <span {...sx(s.when)}>Updated {props.when}</span>
      </div>
    </button>
  );
}

const s = stylex.create({
  row: {
    padding: "12px 14px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    transition: "background 120ms, border-color 120ms",
    backgroundColor: {
      default: colors.paper,
      ":hover": colors.paper2,
    },
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    width: "100%",
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: 500,
  },
  meta: { gap: 10, alignItems: "center", display: "flex" },
  unclassifiedChip: {
    padding: "2px 8px",
    borderRadius: radii.sm,
    backgroundColor: colors.warnSoft,
    color: colors.warn,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.02em",
  },
  when: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
});
