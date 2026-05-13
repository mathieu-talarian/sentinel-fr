import type { Meta, StoryObj } from "@storybook/react-vite";

import { RailHeader } from "./RailHeader";

const meta = {
  title: "molecules/RailHeader",
  component: RailHeader,
  tags: ["autodocs"],
  args: { version: "v0.2.0" },
  decorators: [
    (Story) => (
      <div style={{ width: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RailHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
