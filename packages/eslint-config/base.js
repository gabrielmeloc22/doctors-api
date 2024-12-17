import eslint from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import onlyWarn from "eslint-plugin-only-warn"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export const config = [
    ...tseslint.config(
        eslint.configs.recommended,
        eslintConfigPrettier,
        tseslint.configs.recommendedTypeChecked,
        {
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: import.meta.dirname,
                },
            },
        },
        {
            rules: {
                "@typescript-eslint/no-explicit-any": [
                    "error",
                    { ignoreRestArgs: true },
                ],
                "@typescript-eslint/explicit-function-return-type": "error",
            },
        }
    ),
    {
        plugins: {
            turbo: turboPlugin,
        },
    },
    {
        plugins: {
            onlyWarn,
        },
    },
    {
        ignores: ["dist/**", "eslint.config.js"],
    },
]
