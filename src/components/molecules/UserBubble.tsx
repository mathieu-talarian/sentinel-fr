import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface UserBubblePropsT {
  text: string;
}

export function UserBubble(props: Readonly<UserBubblePropsT>) {
  return (
    <div {...sx(s.row)}>
      <div {...sx(s.bubble)}>{props.text}</div>
    </div>
  );
}

const s = stylex.create({
  row: { alignSelf: "flex-end", maxWidth: "78%" },
  bubble: {
    background: colors.ink,
    padding: "10px 14px",
    borderRadius: "14px 14px 4px 14px",
    color: colors.paper,
    fontSize: 14,
    lineHeight: 1.55,
  },
});
