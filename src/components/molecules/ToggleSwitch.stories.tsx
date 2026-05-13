import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ToggleSwitch } from "./ToggleSwitch";

const meta = {
  title: "molecules/ToggleSwitch",
  component: ToggleSwitch,
  tags: ["autodocs"],
  args: {
    label: "Inspector auto-open",
    checked: false,
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ToggleSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = { args: { checked: false } };

export const On: Story = { args: { checked: true } };

export const Interactive: Story = {
  args: { label: "Show thinking by default", checked: false },
  render: (args) => {
    const [v, setV] = useState(false);
    return <ToggleSwitch {...args} checked={v} onChange={setV} />;
  },
};
