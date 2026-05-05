import type { ToolCallStatusT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";

import { Icon } from "~/components/atoms/Icons";
import { animations } from "~/lib/styles/animations.stylex";
import { sx } from "~/lib/styles/sx";
import { borders, colors } from "~/lib/styles/tokens.stylex";

interface ToolPillStatusGlyphPropsT {
  status: ToolCallStatusT;
}

export function ToolPillStatusGlyph(
  props: Readonly<ToolPillStatusGlyphPropsT>,
) {
  return (
    <span {...sx(s.slot, toneFor(props.status))}>
      <Show
        when={props.status !== "in-flight"}
        fallback={<span {...sx(s.spinner)} />}
      >
        <Show when={props.status === "complete"} fallback={<Icon.X />}>
          <Icon.Check />
        </Show>
      </Show>
    </span>
  );
}

const toneFor = (status: ToolCallStatusT) => {
  if (status === "in-flight") return s.inFlight;
  if (status === "complete") return s.complete;
  return s.failed;
};

const s = stylex.create({
  slot: {
    placeItems: "center",
    color: colors.ink3,
    display: "grid",
    flexShrink: 0,
    height: 14,
    width: 14,
  },
  inFlight: { color: colors.goldDeep },
  complete: { color: colors.ok },
  failed: { color: colors.err },
  spinner: {
    borderColor: colors.gold,
    borderRadius: "50%",
    borderStyle: borders.solid,
    borderWidth: borders.thick,
    animationDuration: "0.8s",
    animationIterationCount: "infinite",
    animationName: animations.spin,
    animationTimingFunction: "linear",
    borderTopColor: "transparent",
    height: 12,
    width: 12,
  },
});
