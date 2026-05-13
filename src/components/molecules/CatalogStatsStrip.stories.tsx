import type { Meta, StoryObj } from "@storybook/react-vite";

import { CatalogStatsStrip } from "./CatalogStatsStrip";

const meta = {
  title: "molecules/CatalogStatsStrip",
  component: CatalogStatsStrip,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
  },
  args: {
    htsCodesIndexed: 19438,
    crossRulingsSince: 1989,
    activeAlerts: 12,
    lang: "en",
  },
} satisfies Meta<typeof CatalogStatsStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const French: Story = { args: { lang: "fr" } };

export const Empty: Story = {
  args: { htsCodesIndexed: 0, crossRulingsSince: 0, activeAlerts: 0 },
};
