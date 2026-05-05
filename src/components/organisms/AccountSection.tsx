import type { SessionT } from "@/lib/api/auth";

import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/atoms/Button";
import { Section } from "@/components/molecules/Section";
import { signOut } from "@/lib/api/auth";
import { ME_QUERY_KEY } from "@/lib/api/queries";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface AccountSectionPropsT {
  email: string;
  onSignedOut: () => void;
}

export function AccountSection(props: Readonly<AccountSectionPropsT>) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSettled: () => {
      queryClient.setQueryData<SessionT | null>(ME_QUERY_KEY, null);
    },
  });

  const handleSignOut = () => {
    void (async () => {
      await signOutMutation.mutateAsync();
      props.onSignedOut();
      void navigate({ to: "/login" });
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
        disabled={signOutMutation.isPending}
        onClick={handleSignOut}
      >
        {signOutMutation.isPending ? "Signing out…" : "Sign out"}
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
