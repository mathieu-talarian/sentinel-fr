import type { ProviderT } from "@/lib/state/tweaksSlice";

import * as stylex from "@stylexjs/stylex";

import { InspectorToggleButton } from "@/components/molecules/InspectorToggleButton";
import { SegmentedToggle } from "@/components/molecules/SegmentedToggle";
import { sx } from "@/lib/styles/sx";
import { borders, colors } from "@/lib/styles/tokens.stylex";

type LangT = "en" | "fr";

const PROVIDER_OPTIONS: readonly {
  value: ProviderT;
  label: string;
  title?: string;
}[] = [
  { value: "anthropic", label: "Anthropic", title: "Use Anthropic Claude" },
  { value: "openai", label: "OpenAI", title: "Use OpenAI" },
];

const LANG_OPTIONS: readonly { value: LangT; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "fr", label: "FR" },
];

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
      <span {...sx(s.title)}>{props.title}</span>
      <div {...sx(s.spacer)} />

      <SegmentedToggle
        ariaLabel="LLM provider"
        value={props.provider}
        options={PROVIDER_OPTIONS}
        onChange={props.onProviderChange}
        disabled={props.running}
      />

      <SegmentedToggle
        ariaLabel="Language"
        value={props.lang}
        options={LANG_OPTIONS}
        onChange={props.onLangChange}
      />

      <InspectorToggleButton
        open={props.inspectorOpen}
        enabled={props.inspectorEnabled}
        onClick={props.onToggleInspector}
      />
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
  title: {
    color: colors.ink2,
    fontSize: 13,
    fontWeight: 500,
  },
  spacer: { flex: "1" },
});
