import type { Meta, StoryObj } from "@storybook/react-vite";

import { BrandMark } from "./BrandMark";

const meta = {
  title: "atoms/BrandMark",
  component: BrandMark,
  tags: ["autodocs"],
  argTypes: {
    size: { options: ["sm", "md"], control: { type: "radio" } },
  },
  args: { size: "sm" },
} satisfies Meta<typeof BrandMark>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: "sm" } };

export const Medium: Story = { args: { size: "md" } };
