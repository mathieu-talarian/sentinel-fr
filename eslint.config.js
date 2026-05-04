import globals from "globals";
import {
  base,
  noBarrelFiles,
  tanstackRouter,
  solid,
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
  solid,
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
    "src/lib/api/generated/**",
  ]),
]);
