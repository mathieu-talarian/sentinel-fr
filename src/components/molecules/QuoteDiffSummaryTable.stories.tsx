import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleSummary } from "@/stories/quoteFixtures";

import { QuoteDiffSummaryTable } from "./QuoteDiffSummaryTable";

const meta = {
  title: "molecules/QuoteDiffSummaryTable",
  component: QuoteDiffSummaryTable,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
    showHmf: { control: { type: "boolean" } },
  },
  args: {
    selected: sampleSummary(),
    latest: sampleSummary({
      dutyTotalUsd: 1_900,
      landedCostUsd: 15_120,
      surchargeTotalUsd: 18,
    }),
    lang: "en",
    showHmf: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteDiffSummaryTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SelectedHigher: Story = {};

export const SelectedLower: Story = {
  args: {
    selected: sampleSummary({
      dutyTotalUsd: 1_800,
      landedCostUsd: 14_900,
    }),
    latest: sampleSummary(),
  },
};

export const Identical: Story = {
  args: { selected: sampleSummary(), latest: sampleSummary() },
};
