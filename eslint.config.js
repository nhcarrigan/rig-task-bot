import NaomisConfig from "@nhcarrigan/eslint-config";

export default [
  ...NaomisConfig,
  {
    files: ["**/*.spec.ts"],
    "rules": {
      "max-nested-callbacks": "off",
      "@typescript-eslint/consistent-type-assertions": "off",
      "max-lines-per-function": "off",
      "max-statements": "off",
      "max-lines": "off"
    }
  }
];