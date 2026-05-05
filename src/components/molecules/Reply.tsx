import * as stylex from "@stylexjs/stylex";
import Markdown from "react-markdown";

import { Cursor } from "@/components/atoms/Cursor";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

interface ReplyPropsT {
  text: string;
  streaming: boolean;
}

export function Reply(props: Readonly<ReplyPropsT>) {
  return (
    <div {...sx(s.reply)}>
      <Markdown>{props.text}</Markdown>
      {props.streaming && <Cursor />}
    </div>
  );
}

const s = stylex.create({
  reply: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    lineHeight: 1.65,
  },
});
