/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import type { RouterContextT } from "@/router";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";

import { ErrorFallback } from "@/components/molecules/ErrorFallback";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { darkTheme } from "@/lib/styles/themes";
import { colors } from "@/lib/styles/tokens.stylex";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/react-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRouteWithContext<RouterContextT>()({
  component: RootComponent,
});

function RootComponent() {
  const [tweaks] = useTweaks();

  // Theme is applied to <html> (not a single subtree) so portaled descendants
  // — Radix Dialog and any future Tooltip/Popover/Toast — inherit the same
  // CSS-variable values. CSS custom properties only flow through ancestors,
  // and Radix mounts its portals into `document.body`, outside any in-tree
  // wrapper.
  //
  // `s.root` carries the themed background/color via stylex; `darkTheme`
  // re-binds `colors.*` to the dark palette when active. `data-theme` is
  // also set so the `.reply-html` descendant rules in styles.css (innerHTML
  // content StyleX can't reach) keep working.
  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
    document.documentElement.lang = tweaks.lang;

    const className = sx(
      s.root,
      tweaks.theme === "dark" && darkTheme,
    ).className;
    if (!className) return;
    const tokens = className.split(" ").filter(Boolean);
    document.documentElement.classList.add(...tokens);
    return () => {
      document.documentElement.classList.remove(...tokens);
    };
  }, [tweaks.theme, tweaks.density, tweaks.lang]);

  return (
    <>
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
        <div {...sx(s.app)}>
          <Outlet />
        </div>
      </Sentry.ErrorBoundary>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}

const s = stylex.create({
  // Applied to <html> via classList so theme tokens cascade to body and to
  // every portaled descendant.
  root: {
    backgroundColor: colors.paper,
    color: colors.ink,
  },
  app: {
    backgroundColor: colors.paper,
    color: colors.ink,
    display: "flex",
    flexDirection: "row",
    height: "100vh",
  },
});
