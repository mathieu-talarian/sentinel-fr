import type { Meta, StoryObj } from "@storybook/react-vite";

import { LoginFooter } from "./LoginFooter";

const meta = {
  title: "molecules/LoginFooter",
  component: LoginFooter,
  tags: ["autodocs"],
} satisfies Meta<typeof LoginFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
