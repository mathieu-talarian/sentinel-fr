import type { Meta, StoryObj } from "@storybook/react-vite";

import { Eyebrow } from "./Eyebrow";

const meta = {
  title: "atoms/Eyebrow",
  component: Eyebrow,
  tags: ["autodocs"],
  argTypes: {
    tone: { options: ["default", "accent"], control: { type: "radio" } },
    rule: { control: { type: "boolean" } },
  },
  args: { tone: "default", rule: false, children: "Cases" },
} satisfies Meta<typeof Eyebrow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Accent: Story = { args: { tone: "accent" } };

export const WithRule: Story = { args: { tone: "accent", rule: true } };
