/* eslint-disable react-refresh/only-export-components -- TanStack Router files
   colocate the `Route` config alongside the route component. */
import type { RouterContextT } from "@/router";

import * as stylex from "@stylexjs/stylex";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Suspense, lazy, useEffect } from "react";

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

  // Apply the StyleX theme to <html> rather than a single subtree so portaled
  // descendants (Radix Dialog, etc.) inherit the same CSS-variable values —
  // CSS custom properties only flow through ancestors, and Radix mounts its
  // portals into `document.body`, outside any in-tree wrapper. `data-theme`
  // is still set for the `.reply-html` descendant rules in styles.css that
  // StyleX can't reach (innerHTML content).
  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme;
    document.documentElement.dataset.density = tweaks.density;
    document.documentElement.lang = tweaks.lang;

    const themeClass = sx(tweaks.theme === "dark" && darkTheme).className;
    if (!themeClass) return;
    const tokens = themeClass.split(" ").filter(Boolean);
    document.documentElement.classList.add(...tokens);
    return () => {
      document.documentElement.classList.remove(...tokens);
    };
  }, [tweaks.theme, tweaks.density, tweaks.lang]);

  return (
    <>
      <div {...sx(s.app)}>
        <Outlet />
      </div>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  );
}

const s = stylex.create({
  app: {
    background: colors.paper,
    color: colors.ink,
    display: "flex",
    flexDirection: "row",
    height: "100vh",
  },
});
