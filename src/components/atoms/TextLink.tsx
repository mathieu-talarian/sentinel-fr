import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps, MouseEvent } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

export type TextLinkToneT = "default" | "accent";

interface TextLinkPropsT extends Omit<ComponentProps<"a">, "style"> {
  style?: StyleXStyles;
  tone?: TextLinkToneT;
}

export function TextLink(props: Readonly<TextLinkPropsT>) {
  const { tone, style, href, onClick, children, ...rest } = props;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!href || href === "#") e.preventDefault();
    onClick?.(e);
  };

  return (
    <a
      {...rest}
      href={href ?? "#"}
      {...sx(s.link, tone === "accent" ? s.accent : s.def, style)}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

const s = stylex.create({
  link: {
    textDecoration: {
      default: "none",
      ":hover": "underline",
    },
    cursor: "pointer",
  },
  def: { color: "inherit" },
  accent: { color: colors.goldDeep },
});
