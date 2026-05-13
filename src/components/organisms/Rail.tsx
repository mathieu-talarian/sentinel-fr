import * as stylex from "@stylexjs/stylex";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { RailFooter } from "@/components/molecules/RailFooter";
import { RailHeader } from "@/components/molecules/RailHeader";
import { RailNewCaseButton } from "@/components/molecules/RailNewCaseButton";
import { TweaksPanel } from "@/components/organisms/TweaksPanel";
import { useAuth } from "@/lib/state/auth";
import { sx } from "@/lib/styles/sx";
import { borders, colors } from "@/lib/styles/tokens.stylex";

import { RailCaseList } from "./RailCaseList";

/**
 * Workbench rail. Owns the Settings panel (`TweaksPanel`) so every
 * case route gets it without each route having to wire state through.
 */
export function Rail() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [tweaksOpen, setTweaksOpen] = useState(false);

  return (
    <aside {...sx(s.rail)}>
      <RailHeader version="v1.4" />
      <RailNewCaseButton
        onClick={() => {
          void navigate({ to: "/cases/new" });
        }}
      />
      <RailCaseList />
      <RailFooter
        initial={auth.firebaseUser?.displayName?.[0].toUpperCase() ?? "M"}
        name={auth.firebaseUser?.displayName ?? "Marie L."}
        org="Atelier Vague · ops"
        onOpenSettings={() => {
          setTweaksOpen(true);
        }}
      />
      <TweaksPanel open={tweaksOpen} onOpenChange={setTweaksOpen} />
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
