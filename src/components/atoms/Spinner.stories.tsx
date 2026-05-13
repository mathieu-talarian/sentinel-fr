import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./Spinner";

const meta = {
  title: "atoms/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    tone: { options: ["ink", "paper"], control: { type: "radio" } },
  },
  args: { tone: "ink" },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ink: Story = { args: { tone: "ink" } };

export const Paper: Story = {
  args: { tone: "paper" },
  decorators: [
    (Story) => (
      <div style={{ background: "#222", padding: 16, borderRadius: 8 }}>
        <Story />
      </div>
    ),
  ],
};
