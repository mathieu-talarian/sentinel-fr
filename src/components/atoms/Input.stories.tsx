import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./Input";

const meta = {
  title: "atoms/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["default", "error", "warning", "success"],
      control: { type: "radio" },
    },
    paddedRight: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
  },
  args: {
    state: "default",
    paddedRight: false,
    placeholder: "Search rulings…",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: { defaultValue: "Cotton shirt, men's" },
};

export const Error: Story = {
  args: { state: "error", defaultValue: "0000.00.0000" },
};

export const Warning: Story = {
  args: { state: "warning", defaultValue: "Country of origin missing" },
};

export const Success: Story = {
  args: { state: "success", defaultValue: "6109.10.0011" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Locked while quote runs" },
};

export const PaddedRight: Story = {
  args: { paddedRight: true, defaultValue: "icon-aware padding" },
};
