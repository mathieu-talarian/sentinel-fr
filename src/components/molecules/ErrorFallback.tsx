import * as stylex from "@stylexjs/stylex";

import { Button } from "@/components/atoms/Button";
import { sx } from "@/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  shadows,
} from "@/lib/styles/tokens.stylex";

interface ErrorFallbackPropsT {
  error: unknown;
  resetError: () => void;
}

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unexpected error";
}

export function ErrorFallback(props: Readonly<ErrorFallbackPropsT>) {
  const message = describeError(props.error);

  return (
    <div role="alert" {...sx(s.wrap)}>
      <div {...sx(s.card)}>
        <h2 {...sx(s.title)}>Something went wrong</h2>
        <p {...sx(s.detail)}>{message}</p>
        <Button onClick={props.resetError}>Reload view</Button>
      </div>
    </div>
  );
}

const s = stylex.create({
  wrap: {
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.paper,
    color: colors.ink,
    display: "flex",
    fontFamily: fonts.sans,
    justifyContent: "center",
    height: "100vh",
    width: "100%",
  },
  card: {
    padding: 24,
    borderColor: colors.line,
    borderRadius: radii.lg,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 12,
    backgroundColor: colors.paper2,
    boxShadow: shadows.md,
    display: "flex",
    flexDirection: "column",
    maxWidth: 480,
  },
  title: {
    margin: 0,
    color: colors.ink,
    fontSize: 18,
    fontWeight: 600,
  },
  detail: {
    margin: 0,
    color: colors.ink3,
    fontSize: 13.5,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  },
});
