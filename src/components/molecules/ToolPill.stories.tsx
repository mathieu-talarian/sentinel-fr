import type { Meta, StoryObj } from "@storybook/react-vite";

import type { ToolCallT } from "@/lib/types";

import { ToolPill } from "./ToolPill";

const noop = () => {};

const baseCall = (over: Partial<ToolCallT> = {}): ToolCallT => ({
  id: "call-1",
  tool: "search_codes",
  args: { description: "cotton t-shirt knit men's" },
  status: "in-flight",
  startedAt: 1_700_000_000_000,
  ...over,
});

const meta = {
  title: "molecules/ToolPill",
  component: ToolPill,
  tags: ["autodocs"],
  args: { call: baseCall(), active: false, onClick: noop },
} satisfies Meta<typeof ToolPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SearchingInFlight: Story = {};

export const SearchingComplete: Story = {
  args: { call: baseCall({ status: "complete", durationMs: 480 }) },
};

export const Failed: Story = {
  args: {
    call: baseCall({
      status: "failed",
      errorCode: "rate_limited",
      errorMessage: "provider quota exceeded",
    }),
  },
};

export const LookingUp: Story = {
  args: {
    call: baseCall({
      tool: "get_code_details",
      args: { code: "6109100011" },
      status: "complete",
    }),
  },
};

export const LandedCost: Story = {
  args: {
    call: baseCall({
      tool: "get_landed_cost",
      args: { code: "6203425010" },
      status: "in-flight",
    }),
  },
};

export const Active: Story = {
  args: {
    call: baseCall({ tool: "find_cross_rulings", args: { query: "cotton" } }),
    active: true,
  },
};
