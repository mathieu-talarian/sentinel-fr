import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleQuote, sampleQuoteOlder } from "@/stories/quoteFixtures";

import { QuoteBody } from "./QuoteBody";

const meta = {
  title: "molecules/QuoteBody",
  component: QuoteBody,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
    compareMode: { control: { type: "boolean" } },
    showHmf: { control: { type: "boolean" } },
  },
  args: {
    selectedQuote: sampleQuote(),
    latestQuote: null,
    compareMode: false,
    lang: "en",
    showHmf: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 14 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteBody>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Latest: Story = {};

export const Historical: Story = {
  args: { selectedQuote: sampleQuoteOlder(), latestQuote: null },
};

export const Comparing: Story = {
  args: {
    selectedQuote: sampleQuoteOlder(),
    latestQuote: sampleQuote(),
    compareMode: true,
  },
};

export const AirNoHmf: Story = {
  args: { showHmf: false },
};
