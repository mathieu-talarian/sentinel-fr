import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";

import { animations } from "~/lib/animations.stylex";
import { sx } from "~/lib/sx";
import { colors, fonts } from "~/lib/tokens.stylex";

interface ReplyPropsT {
  text: string;
  streaming: boolean;
}

export function Reply(props: Readonly<ReplyPropsT>) {
  return (
    <div {...sx(s.reply)}>
      <SolidMarkdown renderingStrategy="reconcile" children={props.text} />
      <Show when={props.streaming}>
        <span {...sx(s.cursor)} aria-hidden="true" />
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
  cursor: {
    background: colors.ink,
    animationDuration: "1s",
    animationIterationCount: "infinite",
    animationName: animations.blink,
    animationTimingFunction: "step-end",
    display: "inline-block",
    verticalAlign: "text-bottom",
    height: 14,
    marginLeft: 2,
    width: 7,
  },
});
