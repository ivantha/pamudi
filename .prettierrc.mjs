/** @type {import("prettier").Config} */
export default {
    plugins: ["prettier-plugin-astro"],
    semi: false,
    tabWidth: 4,
    printWidth: 100,
    overrides: [
        { files: "*.astro", options: { parser: "astro" } },
        { files: ["*.yaml", "*.yml", "*.md", "*.mdx"], options: { tabWidth: 2 } },
    ],
}
