import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleLines } from "@/stories/quoteFixtures";

import { QuoteLinesList } from "./QuoteLinesList";

const meta = {
  title: "molecules/QuoteLinesList",
  component: QuoteLinesList,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
  },
  args: { lines: sampleLines, lang: "en" },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteLinesList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeLines: Story = {};

export const SingleLine: Story = { args: { lines: [sampleLines[0]!] } };

export const Empty: Story = { args: { lines: [] } };
