import { fileURLToPath } from "node:url";

import { sentryVitePlugin } from "@sentry/vite-plugin";
import stylexPlugin from "@stylexjs/unplugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_SENTINEL_API_BASE || "https://127.0.0.1:8888";

  // Source-map upload is opt-in: any deploy that wants Sentry-readable
  // stack traces sets all three vars; without them the plugin stays out
  // of the pipeline so dev / fresh checkouts don't need a token.
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN;
  const sentryOrg = env.SENTRY_ORG;
  const sentryProject = env.SENTRY_PROJECT;
  const uploadSentrySourceMaps = Boolean(
    sentryAuthToken && sentryOrg && sentryProject,
  );

  return {
    resolve: {
      alias: {
        "@": srcDir,
      },
    },
    build: {
      sourcemap: uploadSentrySourceMaps ? "hidden" : false,
      rolldownOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes("node_modules")) {
              const w = id.split("/");
              const idx = w.indexOf("node_modules");
              return w[idx + 1];
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: false,
        },
      },
    },
    plugins: [
      mkcert(),
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      stylexPlugin({
        useCSSLayers: true,
        unstable_moduleResolution: { type: "commonJS" },
        aliases: { "@/*": [`${srcDir}/*`] },
      }),
      uploadSentrySourceMaps &&
        sentryVitePlugin({
          reactComponentAnnotation: {
            enabled: true,
          },
          authToken: sentryAuthToken,
          org: sentryOrg,
          project: sentryProject,
          release: env.VITE_APP_RELEASE
            ? { name: env.VITE_APP_RELEASE }
            : undefined,
          sourcemaps: {
            // Strip uploaded maps from the deployed bundle so they're
            // only readable inside Sentry, not via DevTools.
            filesToDeleteAfterUpload: ["./dist/**/*.map"],
          },
        }),
    ],
  };
});
