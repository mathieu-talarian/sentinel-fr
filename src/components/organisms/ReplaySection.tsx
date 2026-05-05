import * as stylex from "@stylexjs/stylex";

import { Section } from "@/components/molecules/Section";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { SUGGESTIONS } from "@/lib/utils/suggestions";

const REPLAY_LABELS = [
  "▶ Replay: leather handbag",
  "▶ Replay: cotton t-shirts",
  "▶ Replay: tariff alert",
] as const;

interface ReplaySectionPropsT {
  onReplay: (text: string) => void;
}

export function ReplaySection(props: Readonly<ReplaySectionPropsT>) {
  return (
    <Section label="Replay">
      {REPLAY_LABELS.map((label, i) => (
        <button
          key={label}
          type="button"
          {...sx(s.btn)}
          onClick={() => {
            props.onReplay(SUGGESTIONS[i].text);
          }}
        >
          {label}
        </button>
      ))}
    </Section>
  );
}

const s = stylex.create({
  btn: {
    background: {
      default: colors.paper2,
      ":hover": colors.paper3,
    },
    padding: "8px 10px",
    borderColor: {
      default: colors.line,
      ":hover": colors.lineStrong,
    },
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    color: {
      default: colors.ink2,
      ":hover": colors.ink,
    },
    cursor: "pointer",
    fontFamily: fonts.mono,
    fontSize: 12.5,
    textAlign: "left",
  },
});
