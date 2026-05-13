import type { Meta, StoryObj } from "@storybook/react-vite";

import { HtsCodeBadge } from "./HtsCodeBadge";

const meta = {
  title: "molecules/HtsCodeBadge",
  component: HtsCodeBadge,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      options: ["default", "selected", "candidate"],
      control: { type: "radio" },
    },
  },
  args: { code: "6109100011", tone: "default" },
} satisfies Meta<typeof HtsCodeBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = { args: { tone: "selected" } };

export const Candidate: Story = { args: { tone: "candidate" } };

export const Row: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <HtsCodeBadge code="6109100011" tone="selected" />
      <HtsCodeBadge code="6109901090" tone="candidate" />
      <HtsCodeBadge code="6110200020" tone="candidate" />
      <HtsCodeBadge code="6203425010" tone="default" />
    </div>
  ),
};
