import type { Meta, StoryObj } from "@storybook/react-vite";

import { Section } from "./Section";

const meta = {
  title: "molecules/Section",
  component: Section,
  tags: ["autodocs"],
  args: {
    label: "Account",
    children: (
      <>
        <div style={{ opacity: 0.7 }}>Signed in as mathieu@acme.example</div>
        <div style={{ opacity: 0.5, fontSize: 12 }}>Member since 2025</div>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Section>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Behaviour: Story = {
  args: {
    label: "Behaviour",
    children: <div>Inspector auto-open · Thinking visible by default</div>,
  },
};
