import type { ReactNode } from "react";

import * as stylex from "@stylexjs/stylex";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Cursor } from "@/components/atoms/Cursor";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";

interface ReplyPropsT {
  text: string;
  streaming: boolean;
}

// `react-markdown` is CommonMark-only by default; `remark-gfm` adds GFM
// (tables, strikethrough, task lists, autolinks). Map the table-family tags
// through stylex so they sit inside the assistant reply's typography scale
// instead of inheriting browser defaults.
const components = {
  table: (props: { children?: ReactNode }) => (
    <table {...sx(t.table)}>{props.children}</table>
  ),
  thead: (props: { children?: ReactNode }) => (
    <thead {...sx(t.thead)}>{props.children}</thead>
  ),
  tr: (props: { children?: ReactNode }) => (
    <tr {...sx(t.tr)}>{props.children}</tr>
  ),
  th: (props: { children?: ReactNode }) => (
    <th {...sx(t.th)}>{props.children}</th>
  ),
  td: (props: { children?: ReactNode }) => (
    <td {...sx(t.td)}>{props.children}</td>
  ),
} as const;

export function Reply(props: Readonly<ReplyPropsT>) {
  return (
    <div {...sx(s.reply)}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {props.text}
      </Markdown>
      {props.streaming && <Cursor />}
    </div>
  );
}

const s = stylex.create({
  reply: {
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    lineHeight: 1.65,
  },
});

const t = stylex.create({
  table: {
    marginBlock: 12,
    borderCollapse: "collapse",
    fontSize: 13,
    width: "100%",
  },
  thead: {
    borderBottomColor: colors.lineStrong,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
  },
  tr: {
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
  },
  th: {
    padding: "6px 10px",
    color: colors.ink2,
    fontWeight: 600,
    textAlign: "left",
  },
  td: {
    padding: "6px 10px",
    color: colors.ink2,
    verticalAlign: "top",
  },
});
