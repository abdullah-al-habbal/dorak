import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const RELATIVE_IMPORT = {
  group: ["./*", "../*", ".", ".."],
  message: "Use the @/ alias instead of relative paths.",
};
const TESTS_ONLY = "Tests belong in tests/, mirroring src/.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    // Absolute imports only: every module specifier goes through the @/ alias.
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [RELATIVE_IMPORT] }],
    },
  },
  {
    // Tests live in tests/ mirroring src/; production code must never import test tooling.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [{ name: "vitest", message: TESTS_ONLY }],
          patterns: [
            RELATIVE_IMPORT,
            { group: ["vitest/*"], message: TESTS_ONLY },
          ],
        },
      ],
    },
  },
  {
    // Module augmentation must repeat the upstream interface's full type
    // parameter list to typecheck, even when the declaration body ignores them.
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]);

export default eslintConfig;
