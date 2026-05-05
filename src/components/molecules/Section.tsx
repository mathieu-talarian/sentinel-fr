import type { ReactNode } from "react";

import * as stylex from "@stylexjs/stylex";

import { Eyebrow } from "@/components/atoms/Eyebrow";
import { sx } from "@/lib/styles/sx";

interface SectionPropsT {
  label: string;
  children: ReactNode;
}

export function Section(props: Readonly<SectionPropsT>) {
  return (
    <div {...sx(s.section)}>
      <Eyebrow>{props.label}</Eyebrow>
      <div {...sx(s.body)}>{props.children}</div>
    </div>
  );
}

const s = stylex.create({
  section: { gap: 10, display: "flex", flexDirection: "column" },
  body: { gap: 10, display: "flex", flexDirection: "column" },
});
