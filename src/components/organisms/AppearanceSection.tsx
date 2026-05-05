import type { TweaksT } from "@/lib/state/tweaksSlice";

import { Section } from "@/components/molecules/Section";
import { SegmentedRadio } from "@/components/molecules/SegmentedRadio";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

interface AppearanceSectionPropsT {
  theme: TweaksT["theme"];
  density: TweaksT["density"];
  onThemeChange: (v: TweaksT["theme"]) => void;
  onDensityChange: (v: TweaksT["density"]) => void;
}

export function AppearanceSection(props: Readonly<AppearanceSectionPropsT>) {
  return (
    <Section label="Appearance">
      <SegmentedRadio
        label="Theme"
        value={props.theme}
        options={THEME_OPTIONS}
        onChange={(v) => {
          props.onThemeChange(v as TweaksT["theme"]);
        }}
      />
      <SegmentedRadio
        label="Density"
        value={props.density}
        options={DENSITY_OPTIONS}
        onChange={(v) => {
          props.onDensityChange(v as TweaksT["density"]);
        }}
      />
    </Section>
  );
}
