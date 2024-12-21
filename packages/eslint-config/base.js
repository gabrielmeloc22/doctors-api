import { default as eslint, default as js } from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import turboPlugin from "eslint-plugin-turbo";
import vitest from "eslint-plugin-vitest";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export const config = [
    ...tseslint.config(
        js.configs.recommended,
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
        files: ["**/__tests__/**"], // or any other pattern
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
        },
        languageOptions: {
            globals: {
                ...vitest.environments.env.globals,
            },
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
];
