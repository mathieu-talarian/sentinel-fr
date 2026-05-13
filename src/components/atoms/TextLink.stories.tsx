import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextLink } from "./TextLink";

const meta = {
  title: "atoms/TextLink",
  component: TextLink,
  tags: ["autodocs"],
  argTypes: {
    tone: { options: ["default", "accent"], control: { type: "radio" } },
  },
  args: { tone: "default", children: "Read the CBP ruling", href: "#" },
} satisfies Meta<typeof TextLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Accent: Story = { args: { tone: "accent" } };

export const Inline: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      See the full <TextLink tone="accent">CBP CROSS ruling</TextLink> for
      additional precedent.
    </p>
  ),
};
