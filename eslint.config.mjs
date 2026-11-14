// ESLint 10 flat config for plain JavaScript on Node. Pack: javascript-node, rules js-eslint-flat,
// js-async-errors, js-no-eval. ESLint 10 reads eslint.config.* only; .eslintrc files are ignored.
// Merge into the project's existing eslint.config.mjs.
import js from "@eslint/js"
import globals from "globals"
import { defineConfig } from "eslint/config"

export default defineConfig([
  { ignores: ["dist", "coverage", "node_modules"] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.node } },
    linterOptions: { reportUnusedDisableDirectives: "error" },
    rules: {
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-throw-literal": "error",
      "prefer-promise-reject-errors": "error",
      "no-async-promise-executor": "error",
      "require-atomic-updates": "error",
      "require-await": "error",
      "no-return-await": "error",
      "no-shadow": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "max-params": ["error", 4],
    },
  },
])
