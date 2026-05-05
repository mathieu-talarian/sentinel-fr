import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface MessageCaveatsPropsT {
  items: readonly string[];
}

export function MessageCaveats(props: Readonly<MessageCaveatsPropsT>) {
  return (
    <div {...sx(s.caveats)}>
      <div {...sx(s.label)}>Caveats</div>
      <ul {...sx(s.list)}>
        {props.items.map((c, i) => (
          <li key={i} {...sx(s.item)}>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

const s = stylex.create({
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
    marginTop: 4,
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
