import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";

import { Cursor } from "~/components/atoms/Cursor";
import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

interface ReplyPropsT {
  text: string;
  streaming: boolean;
}

export function Reply(props: Readonly<ReplyPropsT>) {
  return (
    <div {...sx(s.reply)}>
      <SolidMarkdown renderingStrategy="reconcile" children={props.text} />
      <Show when={props.streaming}>
        <Cursor />
      </Show>
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
