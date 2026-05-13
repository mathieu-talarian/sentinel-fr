import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { SegmentedRadio } from "./SegmentedRadio";

const THEME_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const meta = {
  title: "molecules/SegmentedRadio",
  component: SegmentedRadio,
  tags: ["autodocs"],
  args: {
    label: "Theme",
    value: "dark",
    options: THEME_OPTIONS,
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SegmentedRadio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Static: Story = {};

export const Interactive: Story = {
  args: { value: "system" },
  render: (args) => {
    const [v, setV] = useState("system");
    return <SegmentedRadio {...args} value={v} onChange={setV} />;
  },
};
