import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface MessageErrorPropsT {
  message: string;
}

export function MessageError(props: Readonly<MessageErrorPropsT>) {
  return <div {...sx(s.error)}>Stream error: {props.message}</div>;
}

const s = stylex.create({
  error: {
    padding: "8px 12px",
    borderColor: colors.err,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: colors.errSoft,
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
