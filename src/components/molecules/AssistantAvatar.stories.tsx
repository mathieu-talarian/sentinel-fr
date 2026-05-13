import type { Meta, StoryObj } from "@storybook/react-vite";

import { AssistantAvatar } from "./AssistantAvatar";

const meta = {
  title: "molecules/AssistantAvatar",
  component: AssistantAvatar,
  tags: ["autodocs"],
} satisfies Meta<typeof AssistantAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
