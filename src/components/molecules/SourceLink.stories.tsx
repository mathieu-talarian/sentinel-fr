import type { Meta, StoryObj } from "@storybook/react-vite";

import { SourceLink } from "./SourceLink";

const meta = {
  title: "molecules/SourceLink",
  component: SourceLink,
  tags: ["autodocs"],
  args: {
    label: "HTS 6109.10.0011",
    url: "https://hts.usitc.gov/?query=6109.10.0011",
  },
} satisfies Meta<typeof SourceLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDate: Story = {
  args: { effectiveDate: "2026-01-01" },
};

export const CbpRuling: Story = {
  args: {
    label: "CBP CROSS — N335281",
    url: "https://rulings.cbp.gov/ruling/N335281",
    effectiveDate: "2024-06-12",
  },
};
