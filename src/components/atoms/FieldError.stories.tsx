import type { Meta, StoryObj } from "@storybook/react-vite";

import { FieldError } from "./FieldError";

const meta = {
  title: "atoms/FieldError",
  component: FieldError,
  tags: ["autodocs"],
  args: { message: "Description is required." },
} satisfies Meta<typeof FieldError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Long: Story = {
  args: {
    message:
      "HTS code 8471.30.0100 was rejected — the broker requires a unit of measure for this chapter before the entry can be filed.",
  },
};
