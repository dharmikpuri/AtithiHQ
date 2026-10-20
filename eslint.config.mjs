import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Design-system guard rails. Class strings must use the tokens in `src/app/globals.css`:
 * - text sizes come from the named type scale (`text-body`, `text-title-1`…),
 * - colours come from the palette (`bg-brand-600`, `text-ink-3`…).
 * Tailwind's default sizes are switched off, so `text-sm` would silently do nothing.
 */
const TOKEN_RULES = [
  {
    pattern: String.raw`(^|[\s:"'])text-\[\d`,
    message: "Use a type-scale token (text-body, text-callout, text-title-1…) instead of a pixel font size.",
  },
  {
    pattern: String.raw`(^|[\s:"'])text-(xs|sm|base|lg|xl|[2-9]xl)(\s|$)`,
    message:
      "Tailwind's default text sizes are disabled. Use the type scale in globals.css (text-subhead, text-body…).",
  },
  {
    pattern: String.raw`(^|[\s:"'])(bg|text|border|fill|stroke|from|to|via|ring|outline|shadow)-\[#`,
    message: "Use a colour token from globals.css instead of a raw hex value.",
  },
];

const restrictedSyntax = TOKEN_RULES.flatMap(({ pattern, message }) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
]);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...restrictedSyntax] },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local screenshots and throwaway check scripts (git-ignored).
    ".screenshots/**",
  ]),
]);

export default eslintConfig;
