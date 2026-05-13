import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleFeeRefs, sampleQuote, sampleSummary } from "@/stories/quoteFixtures";

import { QuoteDiffEntryFees } from "./QuoteDiffEntryFees";

const meta = {
  title: "molecules/QuoteDiffEntryFees",
  component: QuoteDiffEntryFees,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
    showHmf: { control: { type: "boolean" } },
  },
  args: {
    selectedQuote: sampleQuote(),
    latestSummary: sampleSummary({
      mpfUsd: 28.5,
      hmfUsd: 15.4,
    }),
    latestRefs: sampleFeeRefs,
    lang: "en",
    showHmf: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteDiffEntryFees>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AirNoHmf: Story = { args: { showHmf: false } };
