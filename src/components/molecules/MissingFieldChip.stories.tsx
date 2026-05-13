import type { Meta, StoryObj } from "@storybook/react-vite";

import { MissingFieldChip } from "./MissingFieldChip";

const noop = () => {};

const meta = {
  title: "molecules/MissingFieldChip",
  component: MissingFieldChip,
  tags: ["autodocs"],
  argTypes: {
    field: {
      options: [
        "transport",
        "countryOfOrigin",
        "declaredValueUsd",
        "lineItems",
        "selectedHtsCode",
        "customsValueUsd",
      ],
      control: { type: "select" },
    },
  },
  args: { field: "transport" },
} satisfies Meta<typeof MissingFieldChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Static: Story = {};

export const Clickable: Story = {
  args: { field: "countryOfOrigin", onClick: noop },
};

export const All: Story = {
  args: { field: "transport" },
  render: () => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 360 }}>
      <MissingFieldChip field="transport" />
      <MissingFieldChip field="countryOfOrigin" />
      <MissingFieldChip field="declaredValueUsd" />
      <MissingFieldChip field="lineItems" />
      <MissingFieldChip field="selectedHtsCode" />
      <MissingFieldChip field="customsValueUsd" />
    </div>
  ),
};
