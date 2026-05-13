import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleSummary } from "@/stories/quoteFixtures";

import { QuoteSummaryTable } from "./QuoteSummaryTable";

const meta = {
  title: "molecules/QuoteSummaryTable",
  component: QuoteSummaryTable,
  tags: ["autodocs"],
  argTypes: {
    showHmf: { control: { type: "boolean" } },
  },
  args: { summary: sampleSummary(), showHmf: true },
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteSummaryTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ocean: Story = {};

export const AirNoHmf: Story = { args: { showHmf: false } };

export const NoInsurance: Story = {
  args: { summary: sampleSummary({ insuranceUsd: 0 }) },
};
