import "@/styles.css";

import type { Preview } from "@storybook/react-vite";
import type { ReactNode } from "react";

import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";

import { sx } from "@/lib/styles/sx";
import { darkTheme } from "@/lib/styles/themes";
import { colors } from "@/lib/styles/tokens.stylex";

type ThemeChoiceT = "dark" | "light";

interface ThemeApplierPropsT {
  theme: ThemeChoiceT;
  children: ReactNode;
}

function ThemeApplier({ theme, children }: Readonly<ThemeApplierPropsT>) {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.lang = "en";
    const className = sx(s.root, theme === "dark" && darkTheme).className;
    if (!className) return;
    const tokens = className.split(" ").filter(Boolean);
    html.classList.add(...tokens);
    return () => {
      html.classList.remove(...tokens);
    };
  }, [theme]);

  return <div {...sx(s.pad)}>{children}</div>;
}

const s = stylex.create({
  root: {
    backgroundColor: colors.paper,
    color: colors.ink,
  },
  pad: {
    padding: 24,
    display: "grid",
    placeItems: "start",
    minHeight: "100dvh",
  },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Surface a11y violations as test-like findings in the panel.
      test: "todo",
    },
  },
  initialGlobals: {
    theme: "dark",
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, { globals }) => {
      const theme: ThemeChoiceT = globals.theme === "light" ? "light" : "dark";
      return (
        <ThemeApplier theme={theme}>
          <Story />
        </ThemeApplier>
      );
    },
  ],
};

export default preview;
