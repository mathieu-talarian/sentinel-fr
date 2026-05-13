import type { Meta, StoryObj } from "@storybook/react-vite";

import type {
  LandedCostQuoteSummaryItemT,
  QuoteSummaryT,
} from "@/lib/api/generated/types.gen";

import { QuoteHistoryDropdown } from "./QuoteHistoryDropdown";

const noop = () => {};

const summary = (over: Partial<QuoteSummaryT> = {}): QuoteSummaryT => ({
  declaredTotalUsd: 12_000,
  dutyTotalUsd: 1_500,
  freightUsd: 1_200,
  hmfUsd: 18,
  insuranceUsd: 60,
  landedCostUsd: 14_800,
  mpfUsd: 28,
  surchargeTotalUsd: 0,
  totalFeesUsd: 46,
  ...over,
});

const quote = (
  id: string,
  createdAt: string,
  over: Partial<LandedCostQuoteSummaryItemT> = {},
): LandedCostQuoteSummaryItemT => ({
  id,
  createdAt,
  referenceDate: createdAt.slice(0, 10),
  summary: summary(),
  transport: "ocean",
  ...over,
});

const quotes: LandedCostQuoteSummaryItemT[] = [
  quote("q3", "2026-05-12T14:18:00Z"),
  quote("q2", "2026-04-29T09:02:00Z", { summary: summary({ landedCostUsd: 14_650 }) }),
  quote("q1", "2026-03-17T16:51:00Z", { summary: summary({ landedCostUsd: 15_120 }) }),
];

const labelFor = (q: LandedCostQuoteSummaryItemT) =>
  `${q.createdAt.slice(0, 10)} · ${q.transport}`;

const meta = {
  title: "molecules/QuoteHistoryDropdown",
  component: QuoteHistoryDropdown,
  tags: ["autodocs"],
  args: { quotes, activeId: "q3", labelFor, onSelect: noop },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteHistoryDropdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Latest: Story = { args: { activeId: "q3" } };

export const Older: Story = { args: { activeId: "q1" } };

export const SingleQuote: Story = {
  args: { quotes: [quotes[0]!], activeId: "q3" },
};
