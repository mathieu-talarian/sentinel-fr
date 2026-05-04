import type { ProviderT } from "~/lib/tweaks";

import * as stylex from "@stylexjs/stylex";

import { Icon } from "~/components/Icons";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

type LangT = "en" | "fr";

interface ChatTopbarPropsT {
  title: string;
  provider: ProviderT;
  lang: LangT;
  running: boolean;
  inspectorOpen: boolean;
  inspectorEnabled: boolean;
  onProviderChange: (p: ProviderT) => void;
  onLangChange: (l: LangT) => void;
  onToggleInspector: () => void;
}

export function ChatTopbar(props: Readonly<ChatTopbarPropsT>) {
  return (
    <div {...sx(s.topbar)}>
      <span {...sx(s.topbarTitle)}>{props.title}</span>
      <div {...sx(s.spacer)} />

      <div {...sx(s.segToggle)} role="radiogroup" aria-label="LLM provider">
        <button
          type="button"
          role="radio"
          aria-checked={props.provider === "anthropic"}
          {...sx(s.segBtn)}
          onClick={() => { props.onProviderChange("anthropic"); }}
          disabled={props.running}
          title="Use Anthropic Claude"
        >
          Anthropic
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={props.provider === "openai"}
          {...sx(s.segBtn)}
          onClick={() => { props.onProviderChange("openai"); }}
          disabled={props.running}
          title="Use OpenAI"
        >
          OpenAI
        </button>
      </div>

      <div {...sx(s.segToggle)} role="radiogroup" aria-label="Language">
        <button
          type="button"
          role="radio"
          aria-checked={props.lang === "en"}
          {...sx(s.segBtn)}
          onClick={() => { props.onLangChange("en"); }}
        >
          EN
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={props.lang === "fr"}
          {...sx(s.segBtn)}
          onClick={() => { props.onLangChange("fr"); }}
        >
          FR
        </button>
      </div>

      <button
        type="button"
        {...sx(
          s.inspectorToggle,
          props.inspectorOpen && s.inspectorToggleOn,
        )}
        disabled={!props.inspectorEnabled}
        onClick={() => { props.onToggleInspector(); }}
      >
        <Icon.Side /> Inspector
      </button>
    </div>
  );
}

const s = stylex.create({
  topbar: {
    padding: "0 20px",
    gap: 10,
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
    height: 48,
  },
  topbarTitle: {
    color: colors.ink2,
    fontSize: 13,
    fontWeight: 500,
  },
  spacer: { flex: "1" },
  segToggle: {
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    display: "flex",
  },
  segBtn: {
    background: {
      default: "transparent",
      ':is([aria-checked="true"])': colors.paper3,
    },
    padding: "4px 10px",
    borderStyle: "none",
    borderWidth: 0,
    color: {
      default: colors.ink4,
      ":hover:not(:disabled)": colors.ink2,
      ':is([aria-checked="true"])': colors.ink,
    },
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.04em",
    opacity: {
      default: 1,
      ":disabled": 0.55,
    },
  },
  inspectorToggle: {
    background: {
      default: colors.paper,
      ":hover": colors.paper3,
    },
    padding: "5px 10px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    alignItems: "center",
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
  inspectorToggleOn: {
    background: colors.ink,
    borderColor: colors.ink,
    color: colors.paper,
  },
});
