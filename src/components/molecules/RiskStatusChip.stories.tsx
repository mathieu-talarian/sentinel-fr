import type { Meta, StoryObj } from "@storybook/react-vite";

import { RiskStatusChip } from "./RiskStatusChip";

const meta = {
  title: "molecules/RiskStatusChip",
  component: RiskStatusChip,
  tags: ["autodocs"],
  argTypes: {
    status: {
      options: ["clear", "needsReview", "incomplete", "notRun"],
      control: { type: "radio" },
    },
  },
  args: { status: "clear" },
} satisfies Meta<typeof RiskStatusChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Clear: Story = { args: { status: "clear" } };
export const NeedsReview: Story = { args: { status: "needsReview" } };
export const Incomplete: Story = { args: { status: "incomplete" } };
export const NotRun: Story = { args: { status: "notRun" } };
