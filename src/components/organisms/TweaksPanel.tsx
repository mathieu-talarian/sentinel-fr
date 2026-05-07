import { TweaksDialogShell } from "@/components/templates/TweaksDialogShell";
import { useAuth } from "@/lib/state/auth";
import { useTweaks } from "@/lib/state/tweaks";

import { AccountSection } from "./AccountSection";
import { AppearanceSection } from "./AppearanceSection";
import { BehaviourSection } from "./BehaviourSection";
import { ReplaySection } from "./ReplaySection";

interface TweaksPanelPropsT {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplay: (text: string) => void;
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

      <ReplaySection onReplay={props.onReplay} />

      {accountEmail && (
        <AccountSection email={accountEmail} onSignedOut={close} />
      )}
    </TweaksDialogShell>
  );
}
