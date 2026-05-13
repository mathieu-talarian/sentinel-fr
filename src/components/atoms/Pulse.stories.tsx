import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pulse } from "./Pulse";

const meta = {
  title: "atoms/Pulse",
  component: Pulse,
  tags: ["autodocs"],
} satisfies Meta<typeof Pulse>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Pulse />
      <span>Thinking…</span>
    </div>
  ),
};
