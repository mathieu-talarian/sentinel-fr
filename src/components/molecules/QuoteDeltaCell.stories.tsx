import type { Meta, StoryObj } from "@storybook/react-vite";

import type { QuoteDeltaT } from "@/lib/utils/quoteDiff";

import { QuoteDeltaCell } from "./QuoteDeltaCell";

const delta = (over: Partial<QuoteDeltaT> = {}): QuoteDeltaT => ({
  amountUsd: 0,
  pct: 0,
  direction: "flat",
  ...over,
});

const meta = {
  title: "molecules/QuoteDeltaCell",
  component: QuoteDeltaCell,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
    hidePct: { control: { type: "boolean" } },
  },
  args: { delta: delta(), lang: "en", hidePct: false },
} satisfies Meta<typeof QuoteDeltaCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Flat: Story = { args: { delta: delta() } };

export const Up: Story = {
  args: { delta: delta({ amountUsd: 84.5, pct: 0.073, direction: "up" }) },
};

export const Down: Story = {
  args: { delta: delta({ amountUsd: -42, pct: -0.018, direction: "down" }) },
};

export const NoPct: Story = {
  args: {
    delta: delta({ amountUsd: 15, pct: null, direction: "up" }),
    hidePct: true,
  },
};

export const French: Story = {
  args: {
    delta: delta({ amountUsd: 1234.56, pct: 0.125, direction: "up" }),
    lang: "fr",
  },
};
