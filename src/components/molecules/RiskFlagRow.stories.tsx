import type { Meta, StoryObj } from "@storybook/react-vite";

import type { RiskFlagT } from "@/lib/api/generated/types.gen";

import { RiskFlagRow } from "./RiskFlagRow";

const baseFlag = (over: Partial<RiskFlagT> = {}): RiskFlagT => ({
  code: "section301Possible",
  severity: "review",
  title: "Possible Section 301 exposure",
  reason:
    "HTS 6109.10 is on the active Section 301 list when imported from China — current line declares China as country of origin.",
  nextAction: "Confirm with broker; surcharge not modelled in this quote.",
  lineItemId: "line-1",
  source: {
    label: "USTR Section 301 list (effective 2024-05-01)",
    url: "https://ustr.gov/section-301",
  },
  ...over,
});

const positions: Map<string, number> = new Map([["line-1", 1]]);

const meta = {
  title: "molecules/RiskFlagRow",
  component: RiskFlagRow,
  tags: ["autodocs"],
  args: { flag: baseFlag(), linePositionsById: positions },
  decorators: [
    (Story) => (
      <ul style={{ width: 560, listStyle: "none", padding: 0, margin: 0 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof RiskFlagRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Review: Story = {};

export const Blocking: Story = {
  args: {
    flag: baseFlag({
      code: "missingHtsCode",
      severity: "blocking",
      title: "HTS code missing",
      reason: "Line item has no selected HTS code; quote cannot proceed.",
      nextAction: "Open the line and pick a candidate, or run classify.",
    }),
  },
};

export const Info: Story = {
  args: {
    flag: baseFlag({
      code: "deMinimisIssue",
      severity: "info",
      title: "Below de minimis",
      reason: "Declared value is under $800 — duty-free entry may apply.",
      nextAction: "Check with broker if this entry is eligible.",
    }),
  },
};

export const CaseLevel: Story = {
  args: { flag: baseFlag({ lineItemId: null }) },
};
