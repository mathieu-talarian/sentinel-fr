import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageError } from "./MessageError";

const meta = {
  title: "molecules/MessageError",
  component: MessageError,
  tags: ["autodocs"],
  args: { message: "Connection reset while streaming response." },
} satisfies Meta<typeof MessageError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RateLimited: Story = {
  args: { message: "Provider rate limit exceeded — retrying in 6s…" },
};
