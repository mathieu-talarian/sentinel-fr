import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface RailConvoItemPropsT {
  title: string;
  when: string;
  active?: boolean;
}

export function RailConvoItem(props: Readonly<RailConvoItemPropsT>) {
  return (
    <div {...sx(s.convo, props.active && s.convoActive)}>
      <span {...sx(s.title, props.active && s.titleActive)}>{props.title}</span>
      <span {...sx(s.when)}>{props.when}</span>
    </div>
  );
}

const s = stylex.create({
  convo: {
    padding: "8px 10px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 2,
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  convoActive: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
  },
  title: {
    overflow: "hidden",
    color: colors.ink2,
    fontSize: 13,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  titleActive: {
    color: colors.ink,
    fontWeight: 500,
  },
  when: {
    color: colors.ink4,
    fontSize: 11,
    fontVariantNumeric: "tabular-nums",
  },
});
