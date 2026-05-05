import * as stylex from "@stylexjs/stylex";

import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface InspectorToggleButtonPropsT {
  open: boolean;
  enabled: boolean;
  onClick: () => void;
}

export function InspectorToggleButton(
  props: Readonly<InspectorToggleButtonPropsT>,
) {
  return (
    <button
      type="button"
      {...sx(s.btn, props.open && s.btnOn)}
      disabled={!props.enabled}
      onClick={() => {
        props.onClick();
      }}
    >
      <Icon.Side /> Inspector
    </button>
  );
}

const s = stylex.create({
  btn: {
    padding: "5px 10px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    alignItems: "center",
    backgroundColor: {
      default: colors.paper,
      ":hover": colors.paper3,
    },
    color: colors.ink2,
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    display: "flex",
    fontSize: 12,
    opacity: {
      default: 1,
      ":disabled": 0.45,
    },
  },
  btnOn: {
    borderColor: colors.ink,
    backgroundColor: colors.ink,
    color: colors.paper,
  },
});
