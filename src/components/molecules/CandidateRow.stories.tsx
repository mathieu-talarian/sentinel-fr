import type { Meta, StoryObj } from "@storybook/react-vite";

import type { CandidateViewT } from "@/lib/api/generated/types.gen";

import { CandidateRow } from "./CandidateRow";

const noop = () => {};

const baseCandidate = (over: Partial<CandidateViewT> = {}): CandidateViewT => ({
  id: "cand-1",
  code: "6109100011",
  description: { en: "T-shirts, knitted or crocheted, of cotton, men's or boys'" },
  createdAt: "2026-05-13T12:00:00Z",
  lineItemId: "line-1",
  reviewState: "pending",
  source: "classify",
  score: 0.84,
  ...over,
});

const meta = {
  title: "molecules/CandidateRow",
  component: CandidateRow,
  tags: ["autodocs"],
  argTypes: {
    isSelected: { control: { type: "boolean" } },
    busy: {
      options: [null, "accepting", "rejecting", "deleting"],
      control: { type: "select" },
    },
    isReadOnly: { control: { type: "boolean" } },
    lang: { options: ["en", "fr"], control: { type: "radio" } },
  },
  args: {
    candidate: baseCandidate(),
    isSelected: false,
    busy: null,
    isReadOnly: false,
    lang: "en",
    onAccept: noop,
    onReject: noop,
    onDelete: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CandidateRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {};

export const Selected: Story = {
  args: { candidate: baseCandidate({ reviewState: "accepted" }), isSelected: true },
};

export const Accepted: Story = {
  args: { candidate: baseCandidate({ reviewState: "accepted" }) },
};

export const Rejected: Story = {
  args: { candidate: baseCandidate({ reviewState: "rejected", source: "search" }) },
};

export const ManualNoScore: Story = {
  args: {
    candidate: baseCandidate({
      reviewState: "pending",
      source: "manual",
      score: null,
    }),
  },
};

export const Accepting: Story = { args: { busy: "accepting" } };
