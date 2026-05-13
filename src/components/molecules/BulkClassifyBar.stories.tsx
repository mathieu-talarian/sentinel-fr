import type { Meta, StoryObj } from "@storybook/react-vite";

import type { BulkClassifyResponseT } from "@/lib/api/generated/types.gen";

import { BulkClassifyBar } from "./BulkClassifyBar";

const noop = () => {};

const allOk: BulkClassifyResponseT = {
  provider: "openai/gpt-5",
  results: [
    { line_item_id: "l1", status: "ok", result: { tool_calls: [] } as never },
    { line_item_id: "l2", status: "ok", result: { tool_calls: [] } as never },
    { line_item_id: "l3", status: "ok", result: { tool_calls: [] } as never },
  ],
};

const mixed: BulkClassifyResponseT = {
  provider: "openai/gpt-5",
  results: [
    { line_item_id: "l1", status: "ok", result: { tool_calls: [] } as never },
    { line_item_id: "l2", status: "skipped", reason: "already classified" },
    {
      line_item_id: "l3",
      status: "failed",
      error: "no candidates returned by classifier",
    },
    {
      line_item_id: "l4",
      status: "failed",
      error: "provider rate-limited (retry-after 12s)",
    },
  ],
};

const meta = {
  title: "molecules/BulkClassifyBar",
  component: BulkClassifyBar,
  tags: ["autodocs"],
  argTypes: {
    running: { control: { type: "boolean" } },
    isReadOnly: { control: { type: "boolean" } },
    unclassifiedCount: { control: { type: "number", min: 0, max: 50 } },
  },
  args: {
    running: false,
    result: null,
    unclassifiedCount: 4,
    isReadOnly: false,
    onClassify: noop,
    onCancel: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BulkClassifyBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Running: Story = { args: { running: true } };

export const ReadOnly: Story = { args: { isReadOnly: true } };

export const NoneOutstanding: Story = { args: { unclassifiedCount: 0 } };

export const AllOk: Story = {
  args: { unclassifiedCount: 0, result: allOk },
};

export const Mixed: Story = {
  args: { unclassifiedCount: 0, result: mixed },
};
