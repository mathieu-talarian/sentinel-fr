import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "./Card";

const meta = {
  title: "atoms/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    elevation: { options: ["none", "md", "lg"], control: { type: "radio" } },
    gap: { options: ["none", "sm", "md", "lg"], control: { type: "radio" } },
    bordered: { control: { type: "boolean" } },
    padded: { control: { type: "boolean" } },
    width: { control: { type: "number", min: 200, max: 800, step: 20 } },
  },
  args: {
    elevation: "none",
    bordered: true,
    padded: true,
    gap: "md",
    width: 360,
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

const Filler = () => (
  <>
    <h3 style={{ margin: 0 }}>Case 2026-018</h3>
    <p style={{ margin: 0, opacity: 0.7 }}>
      Bulk classification across 14 unclassified line items.
    </p>
  </>
);

export const Default: Story = {
  args: {},
  render: (args) => (
    <Card {...args}>
      <Filler />
    </Card>
  ),
};

export const Borderless: Story = {
  args: { bordered: false, elevation: "md" },
  render: (args) => (
    <Card {...args}>
      <Filler />
    </Card>
  ),
};

export const Lifted: Story = {
  args: { elevation: "lg", gap: "lg" },
  render: (args) => (
    <Card {...args}>
      <Filler />
    </Card>
  ),
};

export const Unpadded: Story = {
  args: { padded: false, gap: "none" },
  render: (args) => (
    <Card {...args}>
      <div style={{ padding: 12, opacity: 0.7 }}>flush content</div>
    </Card>
  ),
};
