import type { Meta, StoryObj } from "@storybook/react-vite";

import { ComposerDisclaimer } from "./ComposerDisclaimer";

const meta = {
  title: "molecules/ComposerDisclaimer",
  component: ComposerDisclaimer,
  tags: ["autodocs"],
} satisfies Meta<typeof ComposerDisclaimer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
