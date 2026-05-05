import { fileURLToPath } from "node:url";

import stylexPlugin from "@stylexjs/unplugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import devtools from "solid-devtools/vite";
import { defineConfig, loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";
import solidPlugin from "vite-plugin-solid";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiTarget = env.VITE_SENTINEL_API_BASE || "https://127.0.0.1:8888";

  return {
    resolve: {
      alias: {
        "~": srcDir,
      },
    },
    optimizeDeps: {
      // `solid-markdown` pulls in CJS deps (`debug`, `vfile`, `unified`, …)
      include: ["micromark", "unified"],
    },
    build: {
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
        "/chat": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          ws: false,
        },
        "/classify": { target: apiTarget, changeOrigin: true, secure: false },
        "/auth": { target: apiTarget, changeOrigin: true, secure: false },
        "/api-doc": { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
    plugins: [
      devtools({
        /* features options - all disabled by default */
        autoname: true, // e.g. enable autoname
      }),
      mkcert(),
      tanstackRouter({ target: "solid", autoCodeSplitting: true }),
      solidPlugin(),
      stylexPlugin({
        useCSSLayers: true,
        unstable_moduleResolution: { type: "commonJS" },
        aliases: { "~/*": [`${srcDir}/*`] },
      }),
    ],
  };
});
