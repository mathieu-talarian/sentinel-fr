import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface CaveatsListPropsT {
  caveats: readonly string[];
  /** Optional uppercase label; defaults to "Caveats". */
  label?: string;
}

/**
 * Bordered caveats block reused by the quote panel, line breakdown, and
 * legacy landed-cost result. Renders nothing when the array is empty.
 */
export function CaveatsList(props: Readonly<CaveatsListPropsT>) {
  if (props.caveats.length === 0) return null;
  return (
    <section {...sx(s.box)}>
      <div {...sx(s.label)}>{props.label ?? "Caveats"}</div>
      <ul {...sx(s.list)}>
        {props.caveats.map((c) => (
          <li key={c} {...sx(s.item)}>
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}

const s = stylex.create({
  box: {
    padding: "8px 12px",
    backgroundColor: colors.paper2,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: radii.sm,
    borderLeftColor: colors.lineStrong,
    borderLeftStyle: borders.solid,
    borderLeftWidth: borders.bold,
    borderTopLeftRadius: 0,
    borderTopRightRadius: radii.sm,
  },
  label: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  list: { margin: 0, paddingLeft: 18 },
  item: {
    margin: "2px 0",
    color: colors.ink3,
    fontSize: 12.5,
    fontStyle: "italic",
  },
});
