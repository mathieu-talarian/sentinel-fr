import type { Meta, StoryObj } from "@storybook/react-vite";

import { FieldLabel } from "./FieldLabel";

const meta = {
  title: "atoms/FieldLabel",
  component: FieldLabel,
  tags: ["autodocs"],
  args: { htmlFor: "demo", children: "Description" },
} satisfies Meta<typeof FieldLabel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInput: Story = {
  args: { htmlFor: "demo-input", children: "Country of origin" },
  render: (args) => (
    <div style={{ display: "grid", gap: 6 }}>
      <FieldLabel {...args} />
      <input
        id="demo-input"
        type="text"
        placeholder="e.g. China"
        style={{ padding: 8, borderRadius: 6, border: "1px solid #555" }}
      />
    </div>
  ),
};
