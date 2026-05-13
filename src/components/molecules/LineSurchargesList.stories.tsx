import type { Meta, StoryObj } from "@storybook/react-vite";

import { sampleSurcharge } from "@/stories/quoteFixtures";

import { LineSurchargesList } from "./LineSurchargesList";

const meta = {
  title: "molecules/LineSurchargesList",
  component: LineSurchargesList,
  tags: ["autodocs"],
  argTypes: {
    lang: { options: ["en", "fr"], control: { type: "radio" } },
  },
  args: { surcharges: [sampleSurcharge()], lang: "en" },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LineSurchargesList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const Multiple: Story = {
  args: {
    surcharges: [
      sampleSurcharge(),
      sampleSurcharge({
        rule_id: "rule-2",
        program: "Section 232 Steel",
        rate_pct: 0.25,
        amount_usd: 1050,
        chapter_99_code: "9903.80.01",
      }),
      sampleSurcharge({
        rule_id: "rule-3",
        program: "IEEPA Fentanyl 2025",
        rate_text: "$10/unit",
        rate_pct: null,
        specific_per_unit_usd: 10,
        specific_unit: "EA",
        amount_usd: 120,
        chapter_99_code: null,
      }),
    ],
  },
};

export const Empty: Story = { args: { surcharges: [] } };
