import type { Meta, StoryObj } from "@storybook/react-vite";

import { Disclaimer } from "./Disclaimer";

const meta = {
  title: "atoms/Disclaimer",
  component: Disclaimer,
  tags: ["autodocs"],
  args: {
    children:
      "AI-generated tariff guidance. Verify CBP rulings before filing entries — Sentinel does not provide legal advice.",
  },
} satisfies Meta<typeof Disclaimer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Short: Story = {
  args: { children: "Estimated values only." },
};
