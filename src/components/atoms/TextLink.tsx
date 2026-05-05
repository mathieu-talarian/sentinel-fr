import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";

export type TextLinkToneT = "default" | "accent";

interface TextLinkPropsT extends Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  "style"
> {
  style?: StyleXStyles;
  tone?: TextLinkToneT;
}

const preventDefault = (e: MouseEvent) => {
  e.preventDefault();
};

export function TextLink(props: Readonly<TextLinkPropsT>) {
  const [own, rest] = splitProps(props, ["tone", "style", "href", "onClick"]);
  const tone = () => (own.tone === "accent" ? s.accent : s.def);
  const href = () => own.href ?? "#";

  const handleClick: JSX.EventHandler<HTMLAnchorElement, MouseEvent> = (e) => {
    if (!own.href || own.href === "#") preventDefault(e);
    const native = own.onClick;
    if (typeof native === "function") native(e);
  };

  return (
    <a
      {...rest}
      href={href()}
      {...sx(s.link, tone(), own.style)}
      onClick={handleClick}
    />
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
