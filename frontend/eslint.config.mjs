import js from "@eslint/js";
import nextPlugin from "eslint-config-next";

export default [
  js.configs.recommended,
  ...nextPlugin,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];
