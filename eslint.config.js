import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import astro from "eslint-plugin-astro"

export default [
    { ignores: ["dist/**", ".astro/**", "node_modules/**"] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    ...astro.configs.recommended,
    {
        // Build-time scripts run in Node, not the browser.
        files: ["scripts/**/*.mjs", "*.config.mjs", "*.config.js"],
        languageOptions: { globals: globals.nodeBuiltin },
    },
]
