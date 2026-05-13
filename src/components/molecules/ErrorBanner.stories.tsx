import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorBanner } from "./ErrorBanner";

const meta = {
  title: "molecules/ErrorBanner",
  component: ErrorBanner,
  tags: ["autodocs"],
  args: { message: "Failed to add line item: description is required." },
} satisfies Meta<typeof ErrorBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Network: Story = {
  args: {
    message:
      "Network error while saving the case. Your changes are queued locally — they'll sync when the connection returns.",
  },
};
