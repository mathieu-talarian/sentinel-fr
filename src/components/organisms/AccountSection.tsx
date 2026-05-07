import * as stylex from "@stylexjs/stylex";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Section } from "@/components/molecules/Section";
import { signOut } from "@/lib/state/authThunks";
import { useAppDispatch } from "@/lib/state/hooks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface AccountSectionPropsT {
  email: string;
  onSignedOut: () => void;
}

export function AccountSection(props: Readonly<AccountSectionPropsT>) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    setSigningOut(true);
    void (async () => {
      try {
        await dispatch(signOut);
        props.onSignedOut();
        void navigate({ to: "/login" });
      } finally {
        setSigningOut(false);
      }
    })();
  };

  return (
    <Section label="Account">
      <div {...sx(s.row)}>
        <span {...sx(s.email)}>{props.email}</span>
      </div>
      <Button
        variant="danger"
        fullWidth
        disabled={signingOut}
        onClick={handleSignOut}
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </Button>
    </Section>
  );
}

const s = stylex.create({
  row: {
    padding: "6px 10px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    alignItems: "center",
    backgroundColor: colors.paper2,
    display: "flex",
  },
  email: {
    overflow: "hidden",
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 12,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});
