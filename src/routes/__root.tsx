import type { RouterContextT } from "~/router";

import * as stylex from "@stylexjs/stylex";
import { Outlet, createRootRouteWithContext } from "@tanstack/solid-router";
import { Suspense, createEffect, lazy } from "solid-js";

import { sx } from "~/lib/sx";
import { darkTheme } from "~/lib/themes";
import { colors } from "~/lib/tokens.stylex";
import { useTweaks } from "~/lib/tweaks";

const TanStackRouterDevtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/solid-router-devtools").then((m) => ({
        default: m.TanStackRouterDevtools,
      })),
    );

export const Route = createRootRouteWithContext<RouterContextT>()({
  component: RootComponent,
});

function RootComponent() {
  const [tweaks] = useTweaks();

  // StyleX components are themed via createTheme on the app shell below.
  // `data-theme` is still set for the `.reply-html` descendant rules in styles.css
  // (innerHTML content can't be reached by StyleX descendant selectors).
  createEffect(() => {
    const t = tweaks();
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.density = t.density;
    document.documentElement.lang = t.lang;
  });

  return (
    <>
      <div {...sx(s.app, tweaks().theme === "dark" && darkTheme)}>
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
