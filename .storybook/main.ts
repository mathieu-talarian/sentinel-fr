import type { StorybookConfig } from "@storybook/react-vite";

import { fileURLToPath } from "node:url";

import stylexPlugin from "@stylexjs/unplugin/vite";
import { mergeConfig } from "vite";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/components/{atoms,molecules}/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  // Storybook spawns its own Vite instance with a minimal config. We
  // re-inject only what stories need to render: the StyleX babel-style
  // transform (otherwise `stylex.create({...})` stays a runtime no-op
  // and components render unstyled) and the `@` path alias. App-only
  // plugins (TanStack Router codegen, mkcert, Sentry) are intentionally
  // left out — the workbench doesn't need any of them.
  viteFinal: (cfg) =>
    mergeConfig(cfg, {
      resolve: {
        alias: { "@": srcDir },
      },
      plugins: [
        stylexPlugin({
          useCSSLayers: true,
          unstable_moduleResolution: { type: "commonJS" },
          aliases: { "@/*": [`${srcDir}/*`] },
        }),
      ],
    }),
};

export default config;
