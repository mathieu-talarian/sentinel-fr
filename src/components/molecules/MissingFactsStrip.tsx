import type { MissingCaseFactKeyT } from "@/lib/state/caseStatus";

import * as stylex from "@stylexjs/stylex";

import { MissingFieldChip } from "@/components/molecules/MissingFieldChip";
import { selectMissingCaseFacts } from "@/lib/state/caseStatus";
import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface MissingFactsStripPropsT {
  case_: Parameters<typeof selectMissingCaseFacts>[0];
  onFieldClick: (field: MissingCaseFactKeyT) => void;
}

export function MissingFactsStrip(props: Readonly<MissingFactsStripPropsT>) {
  const missing = selectMissingCaseFacts(props.case_);
  if (missing.length === 0) return null;
  return (
    <div {...sx(s.strip)}>
      <span {...sx(s.label)}>Missing for quote</span>
      {missing.map((f) => (
        <MissingFieldChip
          key={f}
          field={f}
          onClick={() => {
            props.onFieldClick(f);
          }}
        />
      ))}
    </div>
  );
}

const s = stylex.create({
  strip: {
    padding: "8px 12px",
    borderColor: colors.warnSoft,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    alignItems: "center",
    backgroundColor: colors.warnSoft,
    display: "flex",
    flexWrap: "wrap",
  },
  label: {
    color: colors.warn,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
});
