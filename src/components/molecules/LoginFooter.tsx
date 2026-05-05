import * as stylex from "@stylexjs/stylex";

import { TextLink } from "~/components/atoms/TextLink";
import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

export function LoginFooter() {
  return (
    <div {...sx(s.foot)}>
      <TextLink>Privacy</TextLink>
      <span {...sx(s.sep)}>·</span>
      <TextLink>Terms</TextLink>
      <span {...sx(s.sep)}>·</span>
      <TextLink>Status</TextLink>
    </div>
  );
}

const s = stylex.create({
  foot: {
    gap: 14,
    color: colors.ink4,
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11.5,
    justifyContent: "center",
    letterSpacing: "0.02em",
  },
  sep: { color: colors.ink5 },
});
