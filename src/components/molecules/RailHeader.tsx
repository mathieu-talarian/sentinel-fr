import * as stylex from "@stylexjs/stylex";

import { BrandLockup } from "@/components/molecules/BrandLockup";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

interface RailHeaderPropsT {
  version: string;
}

export function RailHeader(props: Readonly<RailHeaderPropsT>) {
  return (
    <div {...sx(s.head)}>
      <BrandLockup />
      <span {...sx(s.tag)}>{props.version}</span>
    </div>
  );
}

const s = stylex.create({
  head: {
    padding: "16px 14px 10px",
    gap: 8,
    alignItems: "center",
    display: "flex",
  },
  tag: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginLeft: "auto",
  },
});
