import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

export function AssistantAvatar() {
  return <div {...sx(s.icon)}>S</div>;
}

const s = stylex.create({
  icon: {
    borderRadius: 6,
    placeItems: "center",
    backgroundColor: colors.ink,
    color: colors.paper,
    display: "grid",
    flexShrink: 0,
    fontFamily: fonts.serif,
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: 600,
    height: 26,
    marginTop: 2,
    width: 26,
  },
});
