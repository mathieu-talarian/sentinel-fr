import type { Meta, StoryObj } from "@storybook/react-vite";

import { ToolPillStatusGlyph } from "./ToolPillStatusGlyph";

const meta = {
  title: "molecules/ToolPillStatusGlyph",
  component: ToolPillStatusGlyph,
  tags: ["autodocs"],
  argTypes: {
    status: {
      options: ["in-flight", "complete", "failed"],
      control: { type: "radio" },
    },
  },
  args: { status: "in-flight" },
} satisfies Meta<typeof ToolPillStatusGlyph>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InFlight: Story = { args: { status: "in-flight" } };
export const Complete: Story = { args: { status: "complete" } };
export const Failed: Story = { args: { status: "failed" } };
