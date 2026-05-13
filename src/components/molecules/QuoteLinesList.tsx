import type { LandedCostQuoteLineResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { QuoteLineRow } from "@/components/molecules/QuoteLineRow";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface QuoteLinesListPropsT {
  lines: readonly LandedCostQuoteLineResponseT[];
  lang: "en" | "fr";
}

export function QuoteLinesList(props: Readonly<QuoteLinesListPropsT>) {
  return (
    <section {...sx(s.section)}>
      <h3 {...sx(s.title)}>Lines</h3>
      <ul {...sx(s.list)}>
        {props.lines
          .toSorted((a, b) => a.position - b.position)
          .map((line) => (
            <QuoteLineRow key={line.id} line={line} lang={props.lang} />
          ))}
      </ul>
    </section>
  );
}

const s = stylex.create({
  section: { gap: 8, display: "flex", flexDirection: "column" },
  title: {
    margin: 0,
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 6,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
});
