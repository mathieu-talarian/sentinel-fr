import * as stylex from "@stylexjs/stylex";

import { TweaksDialogShell } from "@/components/templates/TweaksDialogShell";
import { useAuth } from "@/lib/state/auth";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";

import { AccountSection } from "./AccountSection";
import { AppearanceSection } from "./AppearanceSection";
import { BehaviourSection } from "./BehaviourSection";
import { LlmUsageSection } from "./LlmUsageSection";

// Injected by Vite's `define` from package.json — see vite.config.ts.
declare const __APP_VERSION__: string;

interface TweaksPanelPropsT {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TweaksPanel(props: Readonly<TweaksPanelPropsT>) {
  const [tweaks, setTweaks] = useTweaks();
  const auth = useAuth();
  const accountEmail = auth.profile?.email ?? auth.firebaseUser?.email ?? null;

  const close = () => {
    props.onOpenChange(false);
  };

  return (
    <TweaksDialogShell
      open={props.open}
      title="Tweaks"
      onOpenChange={props.onOpenChange}
    >
      <AppearanceSection
        theme={tweaks.theme}
        density={tweaks.density}
        onThemeChange={(theme) => {
          setTweaks({ theme });
        }}
        onDensityChange={(density) => {
          setTweaks({ density });
        }}
      />

      <BehaviourSection
        showThinkingByDefault={tweaks.showThinkingByDefault}
        inspectorAutoOpen={tweaks.inspectorAutoOpen}
        onShowThinkingChange={(showThinkingByDefault) => {
          setTweaks({ showThinkingByDefault });
        }}
        onInspectorAutoOpenChange={(inspectorAutoOpen) => {
          setTweaks({ inspectorAutoOpen });
        }}
      />

      <LlmUsageSection />

      {accountEmail && (
        <AccountSection email={accountEmail} onSignedOut={close} />
      )}

      <div {...sx(s.release)} aria-label="Release version">
        v{__APP_VERSION__}
      </div>
    </TweaksDialogShell>
  );
}

const s = stylex.create({
  release: {
    color: colors.ink3,
    fontFamily: fonts.mono,
    fontSize: 11,
    textAlign: "center",
    borderTopColor: colors.line,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thin,
    paddingTop: 12,
  },
});
