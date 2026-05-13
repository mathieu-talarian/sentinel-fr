import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleFeeRefs, sampleSummary } from "@/stories/quoteFixtures";

import { QuoteEntryFees } from "./QuoteEntryFees";

const meta = {
  title: "molecules/QuoteEntryFees",
  component: QuoteEntryFees,
  tags: ["autodocs"],
  argTypes: {
    showHmf: { control: { type: "boolean" } },
  },
  args: {
    summary: sampleSummary(),
    feeScheduleRefs: sampleFeeRefs,
    showHmf: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteEntryFees>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ocean: Story = {};

export const AirNoHmf: Story = { args: { showHmf: false } };

export const NoSchedules: Story = { args: { feeScheduleRefs: [] } };
