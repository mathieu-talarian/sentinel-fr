import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClassificationStateChip } from "./ClassificationStateChip";

const VALUES = ["unclassified", "candidates", "selected", "needsReview"];

const meta = {
  title: "molecules/ClassificationStateChip",
  component: ClassificationStateChip,
  tags: ["autodocs"],
  argTypes: {
    state: { options: VALUES, control: { type: "select" } },
  },
  args: { state: "unclassified" },
} satisfies Meta<typeof ClassificationStateChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unclassified: Story = { args: { state: "unclassified" } };
export const Candidates: Story = { args: { state: "candidates" } };
export const Selected: Story = { args: { state: "selected" } };
export const NeedsReview: Story = { args: { state: "needsReview" } };

export const Unknown: Story = {
  args: { state: "totally-bogus-value" },
  parameters: {
    docs: {
      description: {
        story: "Unknown wire values gracefully fall back to `unclassified`.",
      },
    },
  },
};
