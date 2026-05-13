import type { Meta, StoryObj } from "@storybook/react-vite";

import { FeeRow } from "./FeeRow";

const meta = {
  title: "molecules/FeeRow",
  component: FeeRow,
  tags: ["autodocs"],
  argTypes: {
    feeCode: {
      options: ["mpf_formal", "hmf_ocean", "section_301"],
      control: { type: "select" },
    },
  },
  args: { feeCode: "mpf_formal", amountUsd: 27.75 },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FeeRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoSchedule: Story = {};

export const WithSchedule: Story = {
  args: {
    feeCode: "mpf_formal",
    amountUsd: 27.75,
    schedule: {
      feeCode: "mpf_formal",
      effectiveFrom: "2026-01-01",
      sourceUrl: "https://www.cbp.gov/trade/programs-administration/cofo/mpf",
    },
  },
};

export const HarborMaintenance: Story = {
  args: {
    feeCode: "hmf_ocean",
    amountUsd: 18.5,
    schedule: {
      feeCode: "hmf_ocean",
      effectiveFrom: "2025-04-15",
      sourceUrl: "https://www.cbp.gov/trade/hmf",
    },
  },
};

export const UnknownCode: Story = {
  args: { feeCode: "section_301", amountUsd: 200 },
  parameters: {
    docs: {
      description: {
        story: "Unknown fee codes fall back to the raw code as the label.",
      },
    },
  },
};
