import { Section } from "@/components/molecules/Section";
import { ToggleSwitch } from "@/components/molecules/ToggleSwitch";
import { FEATURE_CASE_WORKBENCH_ENV } from "@/lib/features";

interface BehaviourSectionPropsT {
  showThinkingByDefault: boolean;
  inspectorAutoOpen: boolean;
  caseWorkbench: boolean;
  onShowThinkingChange: (v: boolean) => void;
  onInspectorAutoOpenChange: (v: boolean) => void;
  onCaseWorkbenchChange: (v: boolean) => void;
}

export function BehaviourSection(props: Readonly<BehaviourSectionPropsT>) {
  // When the env flag is already on, the tweaks toggle is OR-ed in and can
  // only force-enable — hide it to avoid suggesting it can disable the
  // surface, since the env wins.
  const showCaseWorkbenchToggle = !FEATURE_CASE_WORKBENCH_ENV;
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
      {showCaseWorkbenchToggle && (
        <ToggleSwitch
          label="Import-case workbench (preview)"
          checked={props.caseWorkbench}
          onChange={props.onCaseWorkbenchChange}
        />
      )}
    </Section>
  );
}
