import type { Meta, StoryObj } from "@storybook/react-vite";

import { CaseTimelineItem } from "./CaseTimelineItem";

const noop = () => {};

const meta = {
  title: "molecules/CaseTimelineItem",
  component: CaseTimelineItem,
  tags: ["autodocs"],
  argTypes: {
    tone: {
      options: ["neutral", "ok", "warn", "err", "info"],
      control: { type: "radio" },
    },
    icon: {
      options: ["Plus", "Coin", "Check", "X", "Bell", "Refresh"],
      control: { type: "select" },
    },
    lang: { options: ["en", "fr"], control: { type: "radio" } },
  },
  args: {
    icon: "Coin",
    tone: "neutral",
    label: "Quote captured",
    detail: "$14,820",
    capturedAt: "2026-05-12T14:18:00Z",
    lang: "en",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CaseTimelineItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Quote: Story = {};

export const RiskCleared: Story = {
  args: { icon: "Check", tone: "ok", label: "Risk screen — clear", detail: undefined },
};

export const RulingAttached: Story = {
  args: {
    icon: "Bell",
    tone: "info",
    label: "Ruling attached",
    detail: "N335281",
  },
};

export const Clickable: Story = {
  args: {
    icon: "Plus",
    tone: "neutral",
    label: "Case created",
    detail: undefined,
    onClick: noop,
  },
};

export const French: Story = { args: { lang: "fr" } };
