import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleQuoteLine, sampleSurcharge } from "@/stories/quoteFixtures";

import { QuoteLineRow } from "./QuoteLineRow";

const meta = {
  title: "molecules/QuoteLineRow",
  component: QuoteLineRow,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
  },
  args: { line: sampleQuoteLine(), lang: "en" },
  decorators: [
    (Story) => (
      <ul style={{ width: 640, listStyle: "none", padding: 0, margin: 0 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof QuoteLineRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithSurcharge: Story = {
  args: {
    line: sampleQuoteLine({
      surcharges: [sampleSurcharge()],
      surchargeTotalUsd: 24.55,
      lineTotalFeesUsd: 717.55,
    }),
  },
};

export const WithCaveats: Story = {
  args: {
    line: sampleQuoteLine({
      caveats: [
        "Rate excludes Section 301 China duties.",
        "Customs value rounded to the nearest dollar.",
      ],
    }),
  },
};

export const SpecificRate: Story = {
  args: {
    line: sampleQuoteLine({
      code: "2103900000",
      description: "Olive oil, virgin",
      rateText: "$3.20/kg",
      dutyAmountUsd: 0,
      dutySpecificAmountUsd: 384,
      lineTotalFeesUsd: 384,
      quantity: 120,
      quantityUnit: "kg",
    }),
  },
};
