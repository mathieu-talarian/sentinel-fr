import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./Textarea";

const meta = {
  title: "atoms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    state: {
      options: ["default", "error", "warning", "success"],
      control: { type: "radio" },
    },
    maxHeight: { control: { type: "number", min: 80, max: 400, step: 20 } },
    disabled: { control: { type: "boolean" } },
    rows: { control: { type: "number", min: 1, max: 8 } },
  },
  args: {
    state: "default",
    rows: 3,
    placeholder: "Describe the next product…",
    maxHeight: 160,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue:
      "Men's cotton t-shirt, navy blue, knit, short-sleeve. Imported from Vietnam.",
  },
};

export const Error: Story = {
  args: { state: "error", defaultValue: "Description too short." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read-only while a quote is running." },
};
