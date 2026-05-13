import { ThinkingPanel } from "@/components/molecules/ThinkingPanel";
import { useTweaks } from "@/lib/state/tweaks";

interface ThinkingPanelContainerPropsT {
  text: string;
  active: boolean;
  ms?: number;
  autoCollapse: boolean;
  defaultOpen: boolean;
}

/**
 * Wiring for `ThinkingPanel`: pulls the active language out of tweaks so
 * the panel can stay free of global-state hooks and remain story-able.
 */
export function ThinkingPanelContainer(
  props: Readonly<ThinkingPanelContainerPropsT>,
) {
  const [tweaks] = useTweaks();
  return <ThinkingPanel {...props} lang={tweaks.lang} />;
}
