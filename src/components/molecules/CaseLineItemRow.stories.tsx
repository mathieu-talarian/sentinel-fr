import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ImportCaseLineItemResponseT } from "@/lib/api/generated/types.gen";

import { CaseLineItemRow } from "./CaseLineItemRow";

const noop = () => {};

const baseLine = (
  over: Partial<ImportCaseLineItemResponseT> = {},
): ImportCaseLineItemResponseT => ({
  id: "line-1",
  caseId: "case-1",
  position: 1,
  description: "Men's cotton t-shirt, knit, short-sleeve",
  classificationState: "selected",
  candidateSummary: { total: 3, pending: 0, accepted: 1, rejected: 2 },
  selectedHtsCode: "6109100011",
  selectedRateText: "16.5%",
  customsValueUsd: 4200,
  quantity: 1200,
  quantityUnit: "EA",
  countryOfOrigin: "VN",
  createdAt: "2026-05-10T12:00:00Z",
  updatedAt: "2026-05-14T08:00:00Z",
  ...over,
});

const meta = {
  title: "molecules/CaseLineItemRow",
  component: CaseLineItemRow,
  tags: ["autodocs"],
  argTypes: {
    classifying: { control: { type: "boolean" } },
    isReadOnly: { control: { type: "boolean" } },
  },
  args: {
    line: baseLine(),
    caseCountryOfOrigin: null,
    classifying: false,
    isReadOnly: false,
    onClassify: noop,
    onRemove: noop,
    onReviewCandidates: noop,
  },
  decorators: [
    (Story) => (
      <ul style={{ width: 720, listStyle: "none", padding: 0, margin: 0 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof CaseLineItemRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const Unclassified: Story = {
  args: {
    line: baseLine({
      classificationState: "unclassified",
      selectedHtsCode: undefined,
      selectedRateText: undefined,
      customsValueUsd: null,
      candidateSummary: { total: 0, pending: 0, accepted: 0, rejected: 0 },
    }),
  },
};

export const NeedsReview: Story = {
  args: {
    line: baseLine({
      classificationState: "needsReview",
      candidateSummary: { total: 3, pending: 3, accepted: 0, rejected: 0 },
    }),
  },
};

export const Classifying: Story = { args: { classifying: true } };

export const CaseDefaultCountry: Story = {
  args: {
    line: baseLine({ countryOfOrigin: null }),
    caseCountryOfOrigin: "VN",
  },
  parameters: {
    docs: {
      description: {
        story:
          "When the line has no country but the case does, the row shows the case default with a muted hint.",
      },
    },
  },
};

export const Readonly: Story = { args: { isReadOnly: true } };
