import type { Meta, StoryObj } from "@storybook/react-vite";

import { CaveatsList } from "./CaveatsList";

const meta = {
  title: "molecules/CaveatsList",
  component: CaveatsList,
  tags: ["autodocs"],
  args: {
    caveats: [
      "Rate excludes Section 301 China duties.",
      "MPF/HMF assumed at default thresholds — confirm with broker.",
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CaveatsList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Two: Story = {};

export const WithLabel: Story = {
  args: { label: "Assumptions" },
};

export const Empty: Story = {
  args: { caveats: [] },
  parameters: {
    docs: {
      description: {
        story: "Renders nothing when the array is empty.",
      },
    },
  },
};
