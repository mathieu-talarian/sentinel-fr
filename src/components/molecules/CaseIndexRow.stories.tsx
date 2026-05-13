import type { Meta, StoryObj } from "@storybook/react-vite";

import { CaseIndexRow } from "./CaseIndexRow";

const noop = () => {};

const meta = {
  title: "molecules/CaseIndexRow",
  component: CaseIndexRow,
  tags: ["autodocs"],
  argTypes: {
    status: {
      options: [
        "draft",
        "classifying",
        "readyForQuote",
        "quoted",
        "needsReview",
        "readyForBroker",
        "archived",
      ],
      control: { type: "select" },
    },
    unclassifiedLineCount: { control: { type: "number", min: 0, max: 30 } },
  },
  args: {
    title: "FW25 inbound — Vietnam knits",
    status: "draft",
    unclassifiedLineCount: 4,
    when: "2 hours ago",
    onClick: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CaseIndexRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Draft: Story = {};

export const Quoted: Story = {
  args: { status: "quoted", unclassifiedLineCount: 0, when: "yesterday" },
};

export const NeedsReview: Story = {
  args: { status: "needsReview", unclassifiedLineCount: 0, when: "10 min ago" },
};

export const Archived: Story = {
  args: { status: "archived", unclassifiedLineCount: 0, when: "Mar 14" },
};
