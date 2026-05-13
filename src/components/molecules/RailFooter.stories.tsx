import type { Meta, StoryObj } from "@storybook/react-vite";

import { RailFooter } from "./RailFooter";

const noop = () => {};

const meta = {
  title: "molecules/RailFooter",
  component: RailFooter,
  tags: ["autodocs"],
  args: {
    initial: "M",
    name: "Mathieu Moullec",
    org: "Acme Importers",
    onOpenSettings: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 260 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RailFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongName: Story = {
  args: {
    name: "Alexandra Wei-Sutherland",
    org: "Continental Logistics Group, LLC",
  },
};
