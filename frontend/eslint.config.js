// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@angular-eslint/prefer-inject": "off",
      "@angular-eslint/directive-selector": "off",
      "@angular-eslint/component-selector": "off",
      "@angular-eslint/no-empty-lifecycle-method": "off",
      "prefer-const": "off",
      "no-empty": "off",
      "no-useless-escape": "off",
      "no-constant-condition": "off",
      "no-case-declarations": "off",
      "no-prototype-builtins": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
    ],
    rules: {
      "@angular-eslint/template/prefer-control-flow": "off",
      "@angular-eslint/template/click-events-have-key-events": "off",
      "@angular-eslint/template/interactive-supports-focus": "off",
      "@angular-eslint/template/elements-content": "off",
      "@angular-eslint/template/label-has-associated-control": "off",
    },
  }
]);
