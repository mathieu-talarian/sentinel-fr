import globals from "globals";
import {
  base,
  noBarrelFiles,
  tanstackRouter,
  react,
  stylex,
  rules,
  strictTsConfigTypeChecked,
} from "@mathieu-talarian/eslint-config";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      ".claude/**",
      ".claude-flow/**",
      ".swarm/**",
      ".yarn/**",
      ".vscode/**",
      "dist/**",
      "node_modules/**",
      "src/routeTree.gen.ts",
      "eslint.config.js",
      "prettier.config.js",
    ],
  },
  base,
  strictTsConfigTypeChecked,
  react,
  tanstackRouter,
  noBarrelFiles,
  stylex,
  {
    rules,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: new URL(".", import.meta.url).pathname,
        projectService: {
          allowDefaultProject: ["eslint.config.js"],
        },
      },
    },
  },
  globalIgnores([
    "dist",
    "eslint.config.js",
    "src/**/*.js",
    "src/**/*.d.ts",
    // `client.gen.ts` is the plugin-emitted entry-point wrapper for the
    // chosen `@hey-api/client-*` plugin. The codegen does NOT honor
    // `output.header`'s `/* eslint-disable */` prefix for this single
    // file (other generated files do — see `openapi-ts.config.ts`).
    "src/lib/api/generated/client.gen.ts",
  ]),
]);
