import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button";

const meta = {
  title: "atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["primary", "secondary", "danger"],
      control: { type: "radio" },
    },
    fullWidth: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
  },
  args: {
    children: "Sign in",
    variant: "primary",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", children: "Sign in" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Cancel" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete case" },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true, children: "Sign in" },
};

export const FullWidth: Story = {
  args: { variant: "primary", fullWidth: true, children: "Continue" },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};
