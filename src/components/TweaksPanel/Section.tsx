import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";

import { sx } from "~/lib/sx";
import { colors, fonts } from "~/lib/tokens.stylex";

interface SectionPropsT {
  label: string;
  children: JSX.Element;
}

export function Section(props: Readonly<SectionPropsT>) {
  return (
    <div {...sx(s.section)}>
      <div {...sx(s.sectionLabel)}>{props.label}</div>
      <div {...sx(s.sectionBody)}>{props.children}</div>
    </div>
  );
}

const s = stylex.create({
  section: { gap: 10, display: "flex", flexDirection: "column" },
  sectionLabel: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  sectionBody: { gap: 10, display: "flex", flexDirection: "column" },
});
