/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { createFileRoute, redirect } from "@tanstack/react-router";

import { Heading } from "@/components/atoms/Heading";
import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { NewCaseForm } from "@/components/organisms/NewCaseForm";
import { Rail } from "@/components/organisms/Rail";
import { store } from "@/lib/state/store";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

export const Route = createFileRoute("/cases/new")({
  beforeLoad: ({ location }) => {
    const { status } = store.getState().auth;
    if (status !== "authed") {
      redirect({
        to: "/login",
        search: { next: location.pathname + location.searchStr },
        throw: true,
      });
    }
  },
  component: NewCasePage,
});

function NewCasePage() {
  return (
    <Sentry.ErrorBoundary
      fallback={(p) => (
        <ErrorFallback
          error={p.error}
          resetError={() => {
            p.resetError();
          }}
        />
      )}
    >
      <Rail />

      <main {...sx(s.main)}>
        <Heading level="h1" size="md">
          New case
        </Heading>
        <p {...sx(s.lede)}>
          Start with a title and one product line. You can add more lines and
          shipment facts inside the workbench.
        </p>
        <NewCaseForm />
      </main>
    </Sentry.ErrorBoundary>
  );
}

const s = stylex.create({
  main: {
    padding: "24px 28px",
    flex: "1",
    gap: 12,
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
    maxWidth: 640,
    minWidth: 0,
    overflowY: "auto",
  },
  lede: {
    margin: 0,
    color: colors.ink3,
    fontSize: 13,
  },
});
