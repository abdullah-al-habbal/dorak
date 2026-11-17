import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "playwright-report/**",
    "test-results/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [{ group: ["./*", "../*"], message: "Use an `@/` (or `@tests/`) alias, never a relative import." }] }],
    },
  },
  {
    files: ["src/components/**/*.tsx"],
    ignores: ["src/components/ui/**"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
]);

export default eslintConfig;
