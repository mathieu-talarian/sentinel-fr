import * as stylex from "@stylexjs/stylex";

import { sx } from "~/lib/sx";
import { borders, colors, radii } from "~/lib/tokens.stylex";

import { ErrorIcon } from "./icons";

interface ErrorBannerPropsT {
  message: string;
}

export function ErrorBanner(props: Readonly<ErrorBannerPropsT>) {
  return (
    <div role="alert" {...sx(s.banner)}>
      <ErrorIcon />
      <span>{props.message}</span>
    </div>
  );
}

const s = stylex.create({
  banner: {
    background: colors.errSoft,
    padding: "8px 12px",
    borderColor: colors.err,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    alignItems: "center",
    color: colors.err,
    display: "flex",
    fontSize: 12.5,
  },
});
