import type { Meta, StoryObj } from "@storybook/react-vite";

import type {
  ImportCaseLineItemResponseT,
  RulingViewT,
} from "@/lib/api/generated/types.gen";

import { RulingsSearchResult } from "./RulingsSearchResult";

const noop = () => {};

const ruling = (over: Partial<RulingViewT> = {}): RulingViewT => ({
  rulingNumber: "N335281",
  rulingDate: "2024-06-12",
  subject:
    "The tariff classification of men's cotton knit t-shirts from Vietnam",
  url: "https://rulings.cbp.gov/ruling/N335281",
  tariffs: [
    { dotted: "6109.10.0011", digits: "6109100011", original: "6109.10.00.11" },
  ],
  ...over,
});

const line = (
  over: Partial<ImportCaseLineItemResponseT> = {},
): ImportCaseLineItemResponseT => ({
  id: "line-1",
  caseId: "case-1",
  position: 1,
  description: "Cotton t-shirt",
  classificationState: "selected",
  candidateSummary: { total: 0, pending: 0, accepted: 0, rejected: 0 },
  createdAt: "2026-05-10T12:00:00Z",
  updatedAt: "2026-05-14T08:00:00Z",
  ...over,
});

const meta = {
  title: "molecules/RulingsSearchResult",
  component: RulingsSearchResult,
  tags: ["autodocs"],
  argTypes: {
    attached: { control: { type: "boolean" } },
    isReadOnly: { control: { type: "boolean" } },
    busyVerdict: {
      options: [null, "yes", "no", "unknown"],
      control: { type: "select" },
    },
  },
  args: {
    ruling: ruling(),
    busyVerdict: null,
    attached: false,
    isReadOnly: false,
    lineItems: [
      line(),
      line({ id: "line-2", position: 2, description: "Cotton trousers" }),
    ],
    onAttach: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RulingsSearchResult>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Searchable: Story = {};

export const Attached: Story = { args: { attached: true } };

export const Attaching: Story = { args: { busyVerdict: "yes" } };

export const NoLines: Story = { args: { lineItems: [] } };

export const Readonly: Story = { args: { isReadOnly: true } };
