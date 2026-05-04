//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";

export default [
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
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
      // SSE reader is an unbounded read loop — needs a constant `while (true)`.
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        { allowConstantLoopConditions: "always" },
      ],
    },
  },
];
