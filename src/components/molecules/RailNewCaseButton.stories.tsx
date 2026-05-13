import type { Meta, StoryObj } from "@storybook/react-vite";

import { RailNewCaseButton } from "./RailNewCaseButton";

const noop = () => {};

const meta = {
  title: "molecules/RailNewCaseButton",
  component: RailNewCaseButton,
  tags: ["autodocs"],
  args: { onClick: noop },
  decorators: [
    (Story) => (
      <div style={{ width: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RailNewCaseButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
