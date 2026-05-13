import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "@/components/atoms/Icons";

import { IconButton } from "./IconButton";

const meta = {
  title: "atoms/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    size: { options: ["sm", "md", "lg"], control: { type: "radio" } },
    variant: {
      options: ["ghost", "ghost-subtle", "primary", "danger"],
      control: { type: "radio" },
    },
    bordered: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
  },
  args: { size: "md", variant: "ghost", bordered: false, disabled: false },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ghost: Story = {
  args: { variant: "ghost", "aria-label": "Settings" },
  render: (args) => (
    <IconButton {...args}>
      <Icon.Settings />
    </IconButton>
  ),
};

export const GhostSubtle: Story = {
  args: { variant: "ghost-subtle", "aria-label": "Search" },
  render: (args) => (
    <IconButton {...args}>
      <Icon.Search />
    </IconButton>
  ),
};

export const Primary: Story = {
  args: { variant: "primary", "aria-label": "Send" },
  render: (args) => (
    <IconButton {...args}>
      <Icon.Send />
    </IconButton>
  ),
};

export const Danger: Story = {
  args: { variant: "danger", "aria-label": "Close" },
  render: (args) => (
    <IconButton {...args}>
      <Icon.X />
    </IconButton>
  ),
};

export const Sizes: Story = {
  args: { "aria-label": "Bell" },
  render: () => (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <IconButton size="sm" aria-label="Bell sm">
        <Icon.Bell />
      </IconButton>
      <IconButton size="md" aria-label="Bell md">
        <Icon.Bell />
      </IconButton>
      <IconButton size="lg" aria-label="Bell lg">
        <Icon.Bell />
      </IconButton>
    </div>
  ),
};

export const Bordered: Story = {
  args: { bordered: true, "aria-label": "Copy" },
  render: (args) => (
    <IconButton {...args}>
      <Icon.Copy />
    </IconButton>
  ),
};
