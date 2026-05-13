import type { Meta, StoryObj } from "@storybook/react-vite";

import type { CaseRulingViewT } from "@/lib/api/generated/types.gen";

import { CaseRulingCard } from "./CaseRulingCard";

const noop = () => {};

const baseRuling = (over: Partial<CaseRulingViewT> = {}): CaseRulingViewT => ({
  rulingNumber: "N335281",
  rulingDate: "2024-06-12",
  subject:
    "The tariff classification of men's cotton knit t-shirts from Vietnam",
  url: "https://rulings.cbp.gov/ruling/N335281",
  assignedHtsCodes: ["6109100011"],
  attachedAt: "2026-05-14T08:00:00Z",
  attachedBy: "mathieu@acme.example",
  lineItemId: "line-1",
  matchNote: "Same fabric construction; broker confirmed mapping.",
  supportsSelectedCode: "yes",
  ...over,
});

const positions: Map<string, number> = new Map([["line-1", 1]]);

const meta = {
  title: "molecules/CaseRulingCard",
  component: CaseRulingCard,
  tags: ["autodocs"],
  argTypes: {
    detaching: { control: { type: "boolean" } },
    refreshing: { control: { type: "boolean" } },
    isReadOnly: { control: { type: "boolean" } },
  },
  args: {
    ruling: baseRuling(),
    linePositionsById: positions,
    detaching: false,
    refreshing: false,
    isReadOnly: false,
    onDetach: noop,
    onRefresh: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CaseRulingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Supports: Story = {};

export const Conflicts: Story = {
  args: { ruling: baseRuling({ supportsSelectedCode: "no" }) },
};

export const Reference: Story = {
  args: {
    ruling: baseRuling({
      supportsSelectedCode: "unknown",
      matchNote: null,
    }),
  },
};

export const CaseLevel: Story = {
  args: {
    ruling: baseRuling({ lineItemId: null, matchNote: null }),
  },
};

export const Refreshing: Story = { args: { refreshing: true } };

export const Detaching: Story = { args: { detaching: true } };
