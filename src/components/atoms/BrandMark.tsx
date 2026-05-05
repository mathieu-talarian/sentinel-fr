import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

interface BrandMarkPropsT extends ComponentProps<"span"> {
  size?: "sm" | "md";
}

export function BrandMark(props: Readonly<BrandMarkPropsT>) {
  const { size, ...rest } = props;
  const sized = () => (size === "md" ? s.md : s.sm);
  return (
    <span {...sx(s.mark, sized())} {...rest}>
      S
    </span>
  );
}

const s = stylex.create({
  mark: {
    background: colors.ink,
    placeItems: "center",
    color: colors.paper,
    display: "grid",
    fontFamily: fonts.serif,
    fontStyle: "italic",
    fontWeight: 600,
  },
  sm: {
    borderRadius: 5,
    fontSize: 13,
    height: 22,
    width: 22,
  },
  md: {
    borderRadius: 6,
    fontSize: 15,
    height: 26,
    width: 26,
  },
});
