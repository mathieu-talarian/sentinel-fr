import type { Meta, StoryObj } from "@storybook/react-vite";

import { BrandLockup } from "./BrandLockup";

const meta = {
  title: "molecules/BrandLockup",
  component: BrandLockup,
  tags: ["autodocs"],
  argTypes: {
    size: { options: ["sm", "md"], control: { type: "radio" } },
  },
  args: { size: "sm" },
} satisfies Meta<typeof BrandLockup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: "sm" } };

export const Medium: Story = { args: { size: "md" } };
