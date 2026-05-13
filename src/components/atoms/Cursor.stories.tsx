import type { Meta, StoryObj } from "@storybook/react-vite";

import { Cursor } from "./Cursor";

const meta = {
  title: "atoms/Cursor",
  component: Cursor,
  tags: ["autodocs"],
} satisfies Meta<typeof Cursor>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Blinking: Story = {
  render: () => (
    <span style={{ fontSize: 16 }}>
      Streaming response<Cursor />
    </span>
  ),
};
