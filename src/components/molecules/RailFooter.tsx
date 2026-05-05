import * as stylex from "@stylexjs/stylex";

import { Avatar } from "~/components/atoms/Avatar";
import { IconButton } from "~/components/atoms/IconButton";
import { Icon } from "~/components/atoms/Icons";
import { sx } from "~/lib/styles/sx";
import { borders, colors } from "~/lib/styles/tokens.stylex";

interface RailFooterPropsT {
  initial: string;
  name: string;
  org: string;
  onOpenSettings: () => void;
}

export function RailFooter(props: Readonly<RailFooterPropsT>) {
  return (
    <div {...sx(s.foot)}>
      <Avatar initial={props.initial} />
      <div {...sx(s.meta)}>
        <span {...sx(s.name)}>{props.name}</span>
        <span {...sx(s.org)}>{props.org}</span>
      </div>
      <span {...sx(s.spacer)}>
        <IconButton
          variant="ghost"
          size="md"
          bordered
          title="Settings"
          onClick={props.onOpenSettings}
        >
          <Icon.Settings />
        </IconButton>
      </span>
    </div>
  );
}

const s = stylex.create({
  foot: {
    padding: 10,
    gap: 10,
    alignItems: "center",
    display: "flex",
    borderTopColor: colors.line,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thin,
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
    minWidth: 0,
  },
  name: { color: colors.ink, fontSize: 13, fontWeight: 500 },
  org: { color: colors.ink4, fontSize: 11 },
  spacer: { marginLeft: "auto" },
});
