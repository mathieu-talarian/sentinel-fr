import type { Meta, StoryObj } from "@storybook/react-vite";

import { Reply } from "./Reply";

const meta = {
  title: "molecules/Reply",
  component: Reply,
  tags: ["autodocs"],
  argTypes: {
    streaming: { control: { type: "boolean" } },
  },
  args: { text: "", streaming: false },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Reply>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Short: Story = {
  args: {
    text: "**Cotton t-shirts** classified as knit garments under heading 6109 attract a base duty rate of **16.5%** when imported from Vietnam.",
  },
};

export const WithTable: Story = {
  args: {
    text: `Here's the per-line breakdown:

| HTS | Description | Duty |
|---|---|---|
| 6109.10.0011 | Cotton t-shirt, men's | 16.5% |
| 6203.42.5010 | Cotton trousers, men's | 16.6% |
| 6204.62.8060 | Cotton trousers, women's | 16.6% |`,
  },
};

export const Streaming: Story = {
  args: {
    text: "Looking up CBP CROSS rulings for the HTS code 6109.10",
    streaming: true,
  },
};
