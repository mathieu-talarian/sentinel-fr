import type { Meta, StoryObj } from "@storybook/react-vite";

import { ClearSelectionPrompt } from "./ClearSelectionPrompt";

const noop = () => {};

const meta = {
  title: "molecules/ClearSelectionPrompt",
  component: ClearSelectionPrompt,
  tags: ["autodocs"],
  argTypes: {
    busy: { control: { type: "boolean" } },
  },
  args: { busy: false, onKeep: noop, onClear: noop },
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClearSelectionPrompt>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Idle: Story = { args: { busy: false } };

export const Busy: Story = { args: { busy: true } };
