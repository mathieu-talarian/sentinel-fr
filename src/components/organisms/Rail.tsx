import * as stylex from "@stylexjs/stylex";
import { useNavigate } from "@tanstack/react-router";

import { RailFooter } from "@/components/molecules/RailFooter";
import { RailHeader } from "@/components/molecules/RailHeader";
import { RailNewCaseButton } from "@/components/molecules/RailNewCaseButton";
import { RailNewChatButton } from "@/components/molecules/RailNewChatButton";
import { useFeatureCaseWorkbench } from "@/lib/features";
import { useAuth } from "@/lib/state/auth";
import { sx } from "@/lib/styles/sx";
import { borders, colors } from "@/lib/styles/tokens.stylex";

import { RailCaseList } from "./RailCaseList";
import { RailHistoryList } from "./RailHistoryList";

interface RailPropsT {
  /**
   * Invoked by `RailNewChatButton` in legacy mode. Ignored when the
   * `caseWorkbench` flag is on — the new-case button navigates to
   * `/cases/new` directly.
   */
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export function Rail(props: Readonly<RailPropsT>) {
  const auth = useAuth();
  const workbench = useFeatureCaseWorkbench();
  const navigate = useNavigate();

  return (
    <aside {...sx(s.rail)}>
      <RailHeader version="v1.4" />
      {workbench ? (
        <RailNewCaseButton
          onClick={() => {
            void navigate({ to: "/cases/new" });
          }}
        />
      ) : (
        <RailNewChatButton onClick={props.onNewChat} />
      )}
      {workbench ? <RailCaseList /> : <RailHistoryList />}
      <RailFooter
        initial={auth.firebaseUser?.displayName?.[0].toUpperCase() ?? "M"}
        name={auth.firebaseUser?.displayName ?? "Marie L."}
        org="Atelier Vague · ops"
        onOpenSettings={props.onOpenSettings}
      />
    </aside>
  );
}

const s = stylex.create({
  rail: {
    backgroundColor: colors.paper2,
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
