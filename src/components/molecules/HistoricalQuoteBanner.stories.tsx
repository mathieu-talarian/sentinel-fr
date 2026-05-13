import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { HistoricalQuoteBanner } from "./HistoricalQuoteBanner";

const meta = {
  title: "molecules/HistoricalQuoteBanner",
  component: HistoricalQuoteBanner,
  tags: ["autodocs"],
  argTypes: {
    compareMode: { control: { type: "boolean" } },
  },
  args: { compareMode: false, onCompareModeChange: () => {} },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HistoricalQuoteBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { compareMode: false } };

export const Comparing: Story = { args: { compareMode: true } };

export const Interactive: Story = {
  render: () => {
    const [v, setV] = useState(false);
    return <HistoricalQuoteBanner compareMode={v} onCompareModeChange={setV} />;
  },
};
