import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { sx } from "~/lib/styles/sx";
import { borders, colors, fonts, radii } from "~/lib/styles/tokens.stylex";

export type ButtonVariantT = "primary" | "secondary" | "danger";

interface ButtonPropsT extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "style"
> {
  style?: StyleXStyles;
  variant?: ButtonVariantT;
  fullWidth?: boolean;
}

export function Button(props: Readonly<ButtonPropsT>) {
  const [own, rest] = splitProps(props, [
    "variant",
    "fullWidth",
    "style",
    "type",
  ]);

  return (
    <button
      type={own.type ?? "button"}
      {...rest}
      {...sx(
        s.btn,
        VARIANTS[own.variant ?? "primary"],
        own.fullWidth && s.full,
        own.style,
      )}
    />
  );
}

const s = stylex.create({
  btn: {
    padding: "11px 14px",
    borderRadius: radii.md,
    gap: 8,
    transition: "background 140ms, border-color 140ms",
    alignItems: "center",
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    display: "flex",
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: 500,
    justifyContent: "center",
    opacity: {
      default: 1,
      ":disabled": 0.55,
    },
  },
  full: { width: "100%" },
});

const VARIANTS = stylex.create({
  primary: {
    background: {
      default: colors.ink,
      ":hover:not(:disabled)": colors.ink2,
    },
    borderStyle: "none",
    borderWidth: 0,
    color: colors.paper,
  },
  secondary: {
    background: {
      default: colors.paper,
      ":hover:not(:disabled)": colors.paper3,
    },
    borderColor: {
      default: colors.lineStrong,
      ":hover:not(:disabled)": colors.ink4,
    },
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    color: colors.ink,
  },
  danger: {
    background: {
      default: "transparent",
      ":hover:not(:disabled)": colors.errSoft,
    },
    borderColor: colors.err,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    color: colors.err,
  },
});
