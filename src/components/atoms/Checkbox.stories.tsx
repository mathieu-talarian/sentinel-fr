import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./Checkbox";

const meta = {
  title: "atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["default", "error", "warning", "success"],
      control: { type: "radio" },
    },
    checked: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
  },
  args: { state: "default", checked: false, disabled: false },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = { args: { checked: false } };

export const Checked: Story = { args: { checked: true } };

export const Error: Story = { args: { state: "error", checked: true } };

export const Warning: Story = { args: { state: "warning", checked: true } };

export const Success: Story = { args: { state: "success", checked: true } };

export const Disabled: Story = { args: { disabled: true, checked: true } };
