import type { StyleXStyles } from "@stylexjs/stylex";

import * as stylex from "@stylexjs/stylex";

import { TextLink } from "@/components/atoms/TextLink";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

interface SourceLinkPropsT {
  label: string;
  url: string;
  /** ISO `YYYY-MM-DD`. Rendered as `effective <date>` after the link. */
  effectiveDate?: string;
  style?: StyleXStyles;
}

export function SourceLink(props: Readonly<SourceLinkPropsT>) {
  return (
    <span {...sx(s.wrap, props.style)}>
      <TextLink
        href={props.url}
        target="_blank"
        rel="noreferrer noopener"
        style={s.link}
      >
        {props.label}
      </TextLink>
      {props.effectiveDate && (
        <span {...sx(s.date)}>effective {props.effectiveDate}</span>
      )}
    </span>
  );
}

const s = stylex.create({
  wrap: {
    gap: 6,
    alignItems: "baseline",
    display: "inline-flex",
    flexWrap: "wrap",
    fontSize: 11.5,
  },
  link: {
    color: colors.ink3,
    textDecorationColor: colors.line,
    textDecorationLine: "underline",
  },
  date: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10.5,
  },
});
