import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from "./CaseFactsFields";

const noop = () => {};

const meta = {
  title: "molecules/CaseFactsFields",
  component: TextField,
  tags: ["autodocs"],
  args: {
    id: "demo",
    label: "Description",
    initial: "Men's cotton t-shirt — Vietnam",
    onCommit: noop,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Select: Story = {
  args: { id: "transport", label: "Transport" },
  render: (args) => (
    <SelectField
      {...args}
      initial="ocean"
      options={["ocean", "air", "truck", "rail"]}
      onCommit={noop}
    />
  ),
};

export const Number: Story = {
  args: { id: "value", label: "Declared value (USD)" },
  render: (args) => (
    <NumberField {...args} initial={12_000} onCommit={noop} />
  ),
};

export const NumberEmpty: Story = {
  args: { id: "value-empty", label: "Declared value (USD)" },
  render: (args) => <NumberField {...args} initial={null} onCommit={noop} />,
};

export const Textarea: Story = {
  args: { id: "notes", label: "Notes" },
  render: (args) => (
    <TextareaField
      {...args}
      initial="Pre-cleared via broker; expect customs hold on first entry."
      onCommit={noop}
    />
  ),
};
