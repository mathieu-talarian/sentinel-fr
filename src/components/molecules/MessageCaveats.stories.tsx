import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCaveats } from "./MessageCaveats";

const meta = {
  title: "molecules/MessageCaveats",
  component: MessageCaveats,
  tags: ["autodocs"],
  args: {
    items: [
      "Rate excludes Section 301 China duties.",
      "MPF/HMF assumed at default thresholds — confirm with broker.",
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MessageCaveats>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Two: Story = {};

export const Many: Story = {
  args: {
    items: [
      "Rate excludes Section 301 China duties.",
      "MPF/HMF assumed at default thresholds — confirm with broker.",
      "Customs value rounded to the nearest dollar.",
      "Country of origin assumed from the case-level default.",
    ],
  },
};

export const Single: Story = {
  args: { items: ["Section 232 steel/aluminum surcharges not modelled."] },
};
