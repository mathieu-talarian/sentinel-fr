import * as stylex from "@stylexjs/stylex";

import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface RailNewChatButtonPropsT {
  onClick: () => void;
}

export function RailNewChatButton(props: Readonly<RailNewChatButtonPropsT>) {
  return (
    <button
      type="button"
      {...sx(s.btn)}
      onClick={() => {
        props.onClick();
      }}
    >
      <Icon.Plus /> New chat
    </button>
  );
}

const s = stylex.create({
  btn: {
    margin: "4px 10px 8px",
    padding: "8px 10px",
    borderColor: {
      default: colors.line,
      ":hover": colors.lineStrong,
    },
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    transition: "background 120ms, border-color 120ms",
    alignItems: "center",
    backgroundColor: {
      default: colors.paper,
      ":hover": colors.paper3,
    },
    color: colors.ink,
    display: "flex",
    fontSize: 13,
    fontWeight: 500,
  },
});
