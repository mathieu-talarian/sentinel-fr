import type { Meta, StoryObj } from "@storybook/react-vite";

import { ErrorFallback } from "./ErrorFallback";

const noop = () => {};

const meta = {
  title: "molecules/ErrorFallback",
  component: ErrorFallback,
  tags: ["autodocs"],
  args: { error: new Error("Failed to load case details."), resetError: noop },
  decorators: [
    (Story) => (
      <div style={{ width: 720, height: 480, position: "relative" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ErrorFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StandardError: Story = {};

export const StringError: Story = {
  args: { error: "GET /cases/case-1 returned 503 Service Unavailable" },
};

export const UnknownShape: Story = {
  args: { error: { type: "weird", code: 99 } },
};

export const LongMessage: Story = {
  args: {
    error: new Error(
      "Boundary caught a render-time exception: cannot read properties of undefined (reading 'rate_text'). This usually means a quote line is missing a surcharges entry that older snapshots had.",
    ),
  },
};
