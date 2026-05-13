import type { Meta, StoryObj } from "@storybook/react-vite";

import { Avatar } from "./Avatar";

const meta = {
  title: "atoms/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    tone: { options: ["gold", "ink"], control: { type: "radio" } },
    size: { control: { type: "number", min: 16, max: 96, step: 2 } },
  },
  args: { initial: "M", tone: "gold", size: 28 },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Gold: Story = { args: { tone: "gold" } };

export const Ink: Story = { args: { tone: "ink" } };

export const Large: Story = { args: { size: 56, initial: "S" } };

export const Group: Story = {
  args: { initial: "M" },
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Avatar initial="M" tone="gold" />
      <Avatar initial="A" tone="ink" />
      <Avatar initial="T" tone="gold" />
    </div>
  ),
};
