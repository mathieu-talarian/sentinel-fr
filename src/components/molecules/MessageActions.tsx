import * as stylex from "@stylexjs/stylex";

import { IconButton } from "@/components/atoms/IconButton";
import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";

const ACTION_BUTTONS = [
  { title: "Copy", Glyph: Icon.Copy },
  { title: "Regenerate", Glyph: Icon.Refresh },
  { title: "Good", Glyph: Icon.ThumbUp },
  { title: "Bad", Glyph: Icon.ThumbDown },
] as const;

export function MessageActions() {
  return (
    <div {...sx(s.actions)}>
      {ACTION_BUTTONS.map((btn) => (
        <IconButton
          key={btn.title}
          size="sm"
          variant="ghost-subtle"
          bordered
          title={btn.title}
        >
          <btn.Glyph />
        </IconButton>
      ))}
    </div>
  );
}

const s = stylex.create({
  actions: {
    gap: 2,
    display: "flex",
    marginTop: 2,
  },
});
