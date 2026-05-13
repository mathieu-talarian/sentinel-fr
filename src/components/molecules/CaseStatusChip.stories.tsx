import type { Meta, StoryObj } from "@storybook/react-vite";

import { CaseStatusChip } from "./CaseStatusChip";

const VALUES = [
  "draft",
  "classifying",
  "readyForQuote",
  "quoted",
  "needsReview",
  "readyForBroker",
  "ready_for_review",
  "archived",
] as const;

const meta = {
  title: "molecules/CaseStatusChip",
  component: CaseStatusChip,
  tags: ["autodocs"],
  argTypes: {
    status: { options: VALUES, control: { type: "select" } },
  },
  args: { status: "draft" },
} satisfies Meta<typeof CaseStatusChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Draft: Story = { args: { status: "draft" } };
export const Classifying: Story = { args: { status: "classifying" } };
export const ReadyForQuote: Story = { args: { status: "readyForQuote" } };
export const Quoted: Story = { args: { status: "quoted" } };
export const NeedsReview: Story = { args: { status: "needsReview" } };
export const ReadyForBroker: Story = { args: { status: "readyForBroker" } };
export const Archived: Story = { args: { status: "archived" } };

export const All: Story = {
  args: { status: "draft" },
  render: () => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 480 }}>
      {VALUES.map((v) => (
        <CaseStatusChip key={v} status={v} />
      ))}
    </div>
  ),
};
