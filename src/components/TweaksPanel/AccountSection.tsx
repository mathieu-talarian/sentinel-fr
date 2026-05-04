import type { SessionT } from "~/lib/auth";

import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient } from "@tanstack/solid-query";
import { useNavigate } from "@tanstack/solid-router";

import { signOut } from "~/lib/auth";
import { ME_QUERY_KEY } from "~/lib/queries";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { Section } from "./Section";

interface AccountSectionPropsT {
  email: string;
  onSignedOut: () => void;
}

export function AccountSection(props: Readonly<AccountSectionPropsT>) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOutMutation = useMutation(() => ({
    mutationFn: signOut,
    onSettled: () => {
      queryClient.setQueryData<SessionT | null>(ME_QUERY_KEY, null);
    },
  }));

  const handleSignOut = () => {
    void (async () => {
      await signOutMutation.mutateAsync();
      props.onSignedOut();
      void navigate({ to: "/login" });
    })();
  };

  return (
    <Section label="Account">
      <div {...sx(s.accountRow)}>
        <span {...sx(s.accountEmail)}>{props.email}</span>
      </div>
      <button
        type="button"
        {...sx(s.signoutBtn)}
        onClick={handleSignOut}
        disabled={signOutMutation.isPending}
      >
        {signOutMutation.isPending ? "Signing out…" : "Sign out"}
      </button>
    </Section>
  );
}

const s = stylex.create({
  accountRow: {
    background: colors.paper2,
    padding: "6px 10px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    alignItems: "center",
    display: "flex",
  },
  accountEmail: {
    overflow: "hidden",
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 12,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  signoutBtn: {
    background: {
      default: "transparent",
      ":hover": colors.errSoft,
    },
    padding: "8px 10px",
    borderColor: colors.err,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    color: colors.err,
    cursor: "pointer",
    fontFamily: fonts.sans,
    fontSize: 12.5,
    fontWeight: 500,
    textAlign: "left",
  },
});
