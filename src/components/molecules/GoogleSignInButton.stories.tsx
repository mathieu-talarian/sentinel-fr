import type { Meta, StoryObj } from "@storybook/react-vite";

import { GoogleSignInButton } from "./GoogleSignInButton";

const noop = () => {};

const meta = {
  title: "molecules/GoogleSignInButton",
  component: GoogleSignInButton,
  tags: ["autodocs"],
  argTypes: {
    busy: { control: { type: "boolean" } },
  },
  args: { busy: false, onClick: noop },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GoogleSignInButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { busy: false } };

export const Connecting: Story = { args: { busy: true } };
