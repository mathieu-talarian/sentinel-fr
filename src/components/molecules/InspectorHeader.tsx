import * as stylex from "@stylexjs/stylex";

import { IconButton } from "~/components/atoms/IconButton";
import { Icon } from "~/components/atoms/Icons";
import { sx } from "~/lib/styles/sx";
import { borders, colors, fonts } from "~/lib/styles/tokens.stylex";

interface InspectorHeaderPropsT {
  onClose: () => void;
}

export function InspectorHeader(props: Readonly<InspectorHeaderPropsT>) {
  return (
    <div {...sx(s.head)}>
      <span {...sx(s.title)}>
        <Icon.Side /> Inspector
        <span {...sx(s.tag)}>tool results</span>
      </span>
      <span {...sx(s.spacer)}>
        <IconButton
          variant="ghost"
          size="sm"
          title="Collapse"
          onClick={props.onClose}
        >
          <Icon.X />
        </IconButton>
      </span>
    </div>
  );
}

const s = stylex.create({
  head: {
    padding: "0 16px",
    gap: 10,
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
    height: 48,
  },
  title: {
    gap: 8,
    alignItems: "center",
    color: colors.ink,
    display: "flex",
    fontSize: 13,
    fontWeight: 500,
  },
  tag: {
    background: colors.goldSoft,
    padding: "2px 6px",
    borderRadius: 3,
    color: colors.goldDeep,
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  spacer: { marginLeft: "auto" },
});
