import type { SuggestionT } from "~/lib/utils/suggestions";

import * as stylex from "@stylexjs/stylex";

import { Icon } from "~/components/atoms/Icons";
import { sx } from "~/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  shadows,
} from "~/lib/styles/tokens.stylex";

interface SuggestionCardPropsT {
  suggestion: SuggestionT;
  onPick: (suggestion: SuggestionT) => void;
}

const dotStyleFor = (id: SuggestionT["id"]) => {
  if (id === "cost") return s.dotCost;
  if (id === "alert") return s.dotAlert;
  return s.dotClassify;
};

export function SuggestionCard(props: Readonly<SuggestionCardPropsT>) {
  return (
    <button
      type="button"
      {...sx(s.card)}
      onClick={() => {
        props.onPick(props.suggestion);
      }}
    >
      <span {...sx(s.tag)}>
        <span {...sx(s.dot, dotStyleFor(props.suggestion.id))} />
        {props.suggestion.tag}
      </span>
      <span {...sx(s.text)}>{props.suggestion.text}</span>
      <span {...sx(s.arrow)}>
        <Icon.Arrow />
      </span>
    </button>
  );
}

const s = stylex.create({
  card: {
    background: {
      default: colors.paper2,
      ":hover": colors.paper,
    },
    padding: "14px 14px 12px",
    borderColor: {
      default: colors.line,
      ":hover": colors.lineStrong,
    },
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    transition: "all 160ms",
    boxShadow: {
      default: "none",
      ":hover": shadows.md,
    },
    color: colors.ink,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    transform: {
      default: "translateY(0)",
      ":hover": "translateY(-1px)",
    },
    minHeight: 132,
  },
  tag: {
    gap: 5,
    alignItems: "center",
    alignSelf: "flex-start",
    color: colors.ink4,
    display: "inline-flex",
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  dot: {
    background: colors.gold,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotClassify: { background: colors.gold },
  dotCost: { background: colors.ok },
  dotAlert: { background: "oklch(0.65 0.12 280)" },
  text: {
    color: colors.ink,
    fontSize: 13.5,
    lineHeight: 1.45,
  },
  arrow: {
    transition: "transform 160ms, color 160ms",
    alignSelf: "flex-end",
    color: colors.ink4,
    marginTop: "auto",
  },
});
