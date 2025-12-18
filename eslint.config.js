const js = require("@eslint/js");
const globals = require("globals");
const reactRefresh = require("eslint-plugin-react-refresh");
const tseslint = require("typescript-eslint");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = tseslint.config(
  {
    ignores: ["**/prisma/client/**"],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    files: ["**/*.{tsx}"],
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  eslintPluginPrettierRecommended,
  {
    files: [`packages/backend/**/*.ts`],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: "packages/backend",
      },
    },
  },
  {
    files: [`packages/frontend/**/*.{ts,tsx}`],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: "packages/frontend",
      },
    },
  },
  {
    files: [`packages/backend/**/*.{ts,tsx}`],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
