import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageActions } from "./MessageActions";

const meta = {
  title: "molecules/MessageActions",
  component: MessageActions,
  tags: ["autodocs"],
} satisfies Meta<typeof MessageActions>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
