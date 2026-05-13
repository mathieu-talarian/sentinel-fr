import type { Meta, StoryObj } from "@storybook/react-vite";

import { RailCaseItem } from "./RailCaseItem";

const noop = () => {};

const meta = {
  title: "molecules/RailCaseItem",
  component: RailCaseItem,
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
    active: { control: { type: "boolean" } },
    unclassifiedLineCount: { control: { type: "number", min: 0, max: 30 } },
  },
  args: {
    title: "FW25 inbound — Vietnam knits",
    when: "2h ago",
    status: "draft",
    unclassifiedLineCount: 0,
    active: false,
    onClick: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RailCaseItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Inactive: Story = {};

export const Active: Story = { args: { active: true, status: "quoted" } };

export const WithUnclassified: Story = {
  args: { status: "draft", unclassifiedLineCount: 4 },
};

export const LongTitle: Story = {
  args: {
    title:
      "FW25 Vietnam mixed-fabric program — knits, wovens, and reinforced bottoms",
  },
};
