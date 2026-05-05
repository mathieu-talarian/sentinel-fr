import * as stylex from "@stylexjs/stylex";

import { RailFooter } from "@/components/molecules/RailFooter";
import { RailHeader } from "@/components/molecules/RailHeader";
import { RailNewChatButton } from "@/components/molecules/RailNewChatButton";
import { sx } from "@/lib/styles/sx";
import { borders, colors } from "@/lib/styles/tokens.stylex";

import { RailHistoryList } from "./RailHistoryList";

interface RailPropsT {
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export function Rail(props: Readonly<RailPropsT>) {
  return (
    <aside {...sx(s.rail)}>
      <RailHeader version="v1.4" />
      <RailNewChatButton onClick={props.onNewChat} />
      <RailHistoryList />
      <RailFooter
        initial="M"
        name="Marie L."
        org="Atelier Vague · ops"
        onOpenSettings={props.onOpenSettings}
      />
    </aside>
  );
}

const s = stylex.create({
  rail: {
    background: colors.paper2,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    borderRightColor: colors.line,
    borderRightStyle: borders.solid,
    borderRightWidth: borders.thin,
    minWidth: 0,
    width: 240,
  },
});
