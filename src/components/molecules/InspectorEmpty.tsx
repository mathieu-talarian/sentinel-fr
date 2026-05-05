import * as stylex from "@stylexjs/stylex";

import { Icon } from "~/components/atoms/Icons";
import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

export function InspectorEmpty() {
  return (
    <div {...sx(s.empty)}>
      <Icon.Sparkle />
      <div>
        When the agent calls a tool, structured results appear here.
        <div {...sx(s.sub)}>
          catalog · code details · landed cost · CROSS rulings
        </div>
      </div>
    </div>
  );
}

const s = stylex.create({
  empty: {
    padding: "60px 20px",
    gap: 12,
    alignItems: "center",
    color: colors.ink4,
    display: "flex",
    flexDirection: "column",
    fontSize: 13,
    textAlign: "center",
  },
  sub: {
    color: colors.ink5,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 6,
  },
});
