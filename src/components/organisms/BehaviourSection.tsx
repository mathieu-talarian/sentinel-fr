import { Section } from "@/components/molecules/Section";
import { ToggleSwitch } from "@/components/molecules/ToggleSwitch";

interface BehaviourSectionPropsT {
  showThinkingByDefault: boolean;
  inspectorAutoOpen: boolean;
  onShowThinkingChange: (v: boolean) => void;
  onInspectorAutoOpenChange: (v: boolean) => void;
}

export function BehaviourSection(props: Readonly<BehaviourSectionPropsT>) {
  return (
    <Section label="Behaviour">
      <ToggleSwitch
        label="Show thinking by default"
        checked={props.showThinkingByDefault}
        onChange={props.onShowThinkingChange}
      />
      <ToggleSwitch
        label="Auto-open inspector on tool result"
        checked={props.inspectorAutoOpen}
        onChange={props.onInspectorAutoOpenChange}
      />
    </Section>
  );
}
