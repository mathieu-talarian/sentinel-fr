import type { Meta, StoryObj } from "@storybook/react-vite";

import { ComposerSendButton } from "./ComposerSendButton";

const noop = () => {};

const meta = {
  title: "molecules/ComposerSendButton",
  component: ComposerSendButton,
  tags: ["autodocs"],
  argTypes: {
    running: { control: { type: "boolean" } },
    canSend: { control: { type: "boolean" } },
  },
  args: { running: false, canSend: true, onSend: noop, onStop: noop },
} satisfies Meta<typeof ComposerSendButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { running: false, canSend: true } };

export const Empty: Story = {
  args: { running: false, canSend: false },
};

export const Running: Story = { args: { running: true } };
