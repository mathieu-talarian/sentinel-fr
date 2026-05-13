import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThinkingPanel } from "./ThinkingPanel";

const SAMPLE = `Looking up HTS 6109.10.0011 to confirm the rate basis.
The CBP CROSS ruling N335281 covers cotton t-shirts and aligns
with the broker's interpretation. Cross-checking the Section 301
list — heading 6109 is not on the active list, so no surcharge.`;

const meta = {
  title: "molecules/ThinkingPanel",
  component: ThinkingPanel,
  tags: ["autodocs"],
  argTypes: {
    active: { control: { type: "boolean" } },
    autoCollapse: { control: { type: "boolean" } },
    defaultOpen: { control: { type: "boolean" } },
    lang: { options: ["en", "fr"], control: { type: "radio" } },
    ms: { control: { type: "number", min: 0, max: 60000, step: 500 } },
  },
  args: {
    text: SAMPLE,
    active: false,
    ms: 1840,
    autoCollapse: true,
    defaultOpen: false,
    lang: "en",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThinkingPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Collapsed: Story = { args: { defaultOpen: false } };

export const Expanded: Story = { args: { defaultOpen: true } };

export const Thinking: Story = {
  args: { active: true, ms: undefined, defaultOpen: true },
};

export const Long: Story = {
  args: {
    text: Array.from({ length: 8 }, () => SAMPLE).join("\n\n"),
    defaultOpen: true,
  },
};
