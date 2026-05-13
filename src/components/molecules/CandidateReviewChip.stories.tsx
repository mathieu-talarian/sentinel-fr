import type { Meta, StoryObj } from "@storybook/react-vite";

import { CandidateReviewChip } from "./CandidateReviewChip";

const noop = () => {};

const meta = {
  title: "molecules/CandidateReviewChip",
  component: CandidateReviewChip,
  tags: ["autodocs"],
  args: {
    summary: { total: 3, pending: 1, accepted: 1, rejected: 1 },
    onClick: noop,
  },
} satisfies Meta<typeof CandidateReviewChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Mixed: Story = {};

export const PendingOnly: Story = {
  args: { summary: { total: 4, pending: 4, accepted: 0, rejected: 0 } },
};

export const Settled: Story = {
  args: { summary: { total: 3, pending: 0, accepted: 2, rejected: 1 } },
};

export const Empty: Story = {
  args: { summary: { total: 0, pending: 0, accepted: 0, rejected: 0 } },
  parameters: {
    docs: {
      description: { story: "Renders nothing when `total` is 0." },
    },
  },
};
