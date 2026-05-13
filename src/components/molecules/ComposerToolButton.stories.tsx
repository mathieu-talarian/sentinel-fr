import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "@/components/atoms/Icons";

import { ComposerToolButton } from "./ComposerToolButton";

const meta = {
  title: "molecules/ComposerToolButton",
  component: ComposerToolButton,
  tags: ["autodocs"],
  args: { title: "Attach file", children: <Icon.Paperclip /> },
} satisfies Meta<typeof ComposerToolButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Search: Story = {
  args: { title: "Search rulings", children: <Icon.Search /> },
};
