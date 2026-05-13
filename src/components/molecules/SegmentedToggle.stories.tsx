import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { SegmentedToggle } from "./SegmentedToggle";

type DensityT = "comfortable" | "compact";

const DENSITY_OPTIONS = [
  { value: "comfortable" as DensityT, label: "COMFORT" },
  { value: "compact" as DensityT, label: "COMPACT" },
];

const meta = {
  title: "molecules/SegmentedToggle",
  component: SegmentedToggle<DensityT>,
  tags: ["autodocs"],
  args: {
    ariaLabel: "Density",
    value: "comfortable",
    options: DENSITY_OPTIONS,
    onChange: () => {},
  },
} satisfies Meta<typeof SegmentedToggle<DensityT>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Comfortable: Story = { args: { value: "comfortable" } };

export const Compact: Story = { args: { value: "compact" } };

export const Disabled: Story = { args: { disabled: true } };

export const Interactive: Story = {
  args: { value: "comfortable" },
  render: (args) => {
    const [v, setV] = useState<DensityT>("comfortable");
    return <SegmentedToggle<DensityT> {...args} value={v} onChange={setV} />;
  },
};
