import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ImportCaseResponseT } from "@/lib/api/generated/types.gen";

import { MissingFactsStrip } from "./MissingFactsStrip";

const noop = () => {};

const baseCase = (over: Partial<ImportCaseResponseT> = {}): ImportCaseResponseT => ({
  id: "case-1",
  title: "FW25 inbound — Vietnam knits",
  status: "draft",
  currency: "USD",
  destinationCountry: "US",
  referenceDate: "2026-05-14",
  createdAt: "2026-05-10T12:00:00Z",
  updatedAt: "2026-05-14T08:00:00Z",
  transport: "ocean",
  countryOfOrigin: "VN",
  declaredValueUsd: 12_000,
  lineItems: [
    {
      id: "l1",
      caseId: "case-1",
      candidateSummary: { total: 0, pending: 0, accepted: 0, rejected: 0 },
      classificationState: "selected",
      description: "Cotton t-shirt",
      position: 1,
      selectedHtsCode: "6109100011",
      customsValueUsd: 4_000,
      createdAt: "2026-05-10T12:00:00Z",
      updatedAt: "2026-05-14T08:00:00Z",
    },
  ],
  ...over,
});

const meta = {
  title: "molecules/MissingFactsStrip",
  component: MissingFactsStrip,
  tags: ["autodocs"],
  args: { case_: baseCase(), onFieldClick: noop },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MissingFactsStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NothingMissing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Renders nothing when every fact is filled in. The strip is conditional UI.",
      },
    },
  },
};

export const MissingTransport: Story = {
  args: { case_: baseCase({ transport: null }) },
};

export const MissingMany: Story = {
  args: {
    case_: baseCase({
      transport: null,
      countryOfOrigin: null,
      declaredValueUsd: null,
      lineItems: [],
    }),
  },
};
