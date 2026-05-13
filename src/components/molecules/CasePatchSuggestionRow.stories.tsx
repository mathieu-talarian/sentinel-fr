import type { Meta, StoryObj } from "@storybook/react-vite";

import type { CasePatchT } from "@/lib/api/generated/types.gen";

import { CasePatchSuggestionRow } from "./CasePatchSuggestionRow";

const noop = () => {};

// The molecule's `formatValue` handles primitive `value`s at runtime
// (string / number / boolean), but the codegen has `value` typed as
// `{ [key: string]: unknown } | null`. Cast through `unknown` so the
// fixtures can stay readable.
const patch = (op: string, path: string, value: unknown, reason: string) =>
  ({ op, path, value, reason }) as unknown as CasePatchT;

const meta = {
  title: "molecules/CasePatchSuggestionRow",
  component: CasePatchSuggestionRow,
  tags: ["autodocs"],
  argTypes: {
    applying: { control: { type: "boolean" } },
    isReadOnly: { control: { type: "boolean" } },
  },
  args: {
    patch: patch(
      "replace",
      "/countryOfOrigin",
      "VN",
      "Description mentions Ho Chi Minh City — assume Vietnam as the country of origin.",
    ),
    applying: false,
    isReadOnly: false,
    onAccept: noop,
    onDismiss: noop,
  },
  decorators: [
    (Story) => (
      <ul style={{ width: 560, listStyle: "none", padding: 0, margin: 0 }}>
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof CasePatchSuggestionRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Replace: Story = {};

export const Add: Story = {
  args: {
    patch: patch(
      "add",
      "/lineItems/0/quantityUnit",
      "EA",
      "Quote requires a unit of measure for this chapter.",
    ),
  },
};

export const Remove: Story = {
  args: {
    patch: patch(
      "remove",
      "/lineItems/2",
      null,
      "Duplicate line item — same HTS code and description as #1.",
    ),
  },
};

export const Applying: Story = { args: { applying: true } };

export const Readonly: Story = { args: { isReadOnly: true } };
