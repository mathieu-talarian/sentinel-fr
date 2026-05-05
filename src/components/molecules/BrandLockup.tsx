import * as stylex from "@stylexjs/stylex";

import { BrandMark } from "~/components/atoms/BrandMark";
import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

interface BrandLockupPropsT {
  size?: "sm" | "md";
}

export function BrandLockup(props: Readonly<BrandLockupPropsT>) {
  const sized = () => (props.size === "md" ? s.md : s.sm);
  return (
    <div {...sx(s.brand, sized())}>
      <BrandMark size={props.size} />
      <span>Sentinel</span>
    </div>
  );
}

const s = stylex.create({
  brand: {
    alignItems: "center",
    color: colors.ink,
    display: "flex",
    fontFamily: fonts.serif,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  sm: { gap: 8, fontSize: 17 },
  md: { gap: 9, fontSize: 18 },
});
