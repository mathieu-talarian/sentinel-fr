import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from "./Heading";

const meta = {
  title: "atoms/Heading",
  component: Heading,
  tags: ["autodocs"],
  argTypes: {
    level: { options: ["h1", "h2", "h3"], control: { type: "radio" } },
    size: { options: ["sm", "md", "lg"], control: { type: "radio" } },
    align: { options: ["start", "center"], control: { type: "radio" } },
  },
  args: {
    children: "Case 2026-018 — Bulk classification",
    level: "h1",
    size: "md",
    align: "start",
  },
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = {
  args: { level: "h1", size: "lg", children: "Sentinel" },
};

export const Small: Story = {
  args: { level: "h3", size: "sm", children: "Recent rulings" },
};

export const Centered: Story = {
  args: { level: "h2", align: "center", children: "Sign in to continue" },
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
};
