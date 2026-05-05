import * as stylex from "@stylexjs/stylex";

import { ErrorIcon } from "~/components/atoms/icons/ErrorIcon";
import { sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";

interface FieldErrorPropsT {
  message: string;
}

export function FieldError(props: Readonly<FieldErrorPropsT>) {
  return (
    <div {...sx(s.row)}>
      <ErrorIcon />
      <span>{props.message}</span>
    </div>
  );
}

const s = stylex.create({
  row: {
    gap: 4,
    alignItems: "center",
    color: colors.err,
    display: "flex",
    fontSize: 12,
  },
});
