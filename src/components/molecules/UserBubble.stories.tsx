import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserBubble } from "./UserBubble";

const meta = {
  title: "molecules/UserBubble",
  component: UserBubble,
  tags: ["autodocs"],
  args: {
    text: "What's the duty rate for cotton t-shirts from Vietnam?",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 520, display: "flex", flexDirection: "column" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UserBubble>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Short: Story = {};

export const Long: Story = {
  args: {
    text: "Walk me through how Sentinel decides between heading 6109 and 6110 for a knit cotton garment with both crew-neck and zippered options. I want to understand which features push the classification one way or the other.",
  },
};
