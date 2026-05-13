import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleLines, sampleQuoteLine } from "@/stories/quoteFixtures";

import { QuoteDiffLinesList } from "./QuoteDiffLinesList";

const meta = {
  title: "molecules/QuoteDiffLinesList",
  component: QuoteDiffLinesList,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
  },
  args: {
    selectedLines: sampleLines,
    latestLines: [
      sampleQuoteLine({ lineTotalFeesUsd: 705 }),
      sampleLines[1]!,
      sampleLines[2]!,
    ],
    lang: "en",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuoteDiffLinesList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Aligned: Story = {};

export const AddedRemoved: Story = {
  args: {
    selectedLines: [sampleLines[0]!, sampleLines[1]!],
    latestLines: [
      sampleLines[0]!,
      sampleQuoteLine({
        id: "line-4",
        position: 4,
        code: "4202220000",
        description: "Handbag, cotton",
        lineTotalFeesUsd: 320,
      }),
    ],
  },
};
