import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface CasePlaceholderPanelPropsT {
  title: string;
  description: string;
  /** Optional phase hint shown in mono small print at the bottom. */
  phase?: string;
}

/**
 * Reusable empty-state panel used for inspector tabs whose backend
 * surface or UI is scheduled for a later phase. Mounting them in Phase 4
 * keeps the tab structure honest (5 tabs across all phases) while
 * surfacing what's coming.
 */
export function CasePlaceholderPanel(
  props: Readonly<CasePlaceholderPanelPropsT>,
) {
  return (
    <section {...sx(s.panel)}>
      <h2 {...sx(s.title)}>{props.title}</h2>
      <p {...sx(s.desc)}>{props.description}</p>
      {props.phase && <p {...sx(s.phase)}>Lands in {props.phase}.</p>}
    </section>
  );
}

const s = stylex.create({
  panel: {
    padding: "20px 16px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: borders.thin,
    gap: 6,
    backgroundColor: colors.paper2,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  title: {
    margin: 0,
    color: colors.ink2,
    fontFamily: fonts.serif,
    fontSize: 14,
    fontWeight: 500,
  },
  desc: {
    margin: 0,
    color: colors.ink3,
    fontSize: 12.5,
    lineHeight: 1.5,
  },
  phase: {
    margin: 0,
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
});
