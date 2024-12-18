import { FlatCompat } from "@eslint/eslintrc"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import { config as baseConfig } from "./base.js"

const compat = new FlatCompat({
    baseDirectory: import.meta.dirname,
})

/**
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
    ...baseConfig,
    ...compat.extends("next/core-web-vitals"),
    ...compat.extends("next/typescript"),
    pluginReact.configs.flat.recommended,
    {
        plugins: {
            "react-hooks": pluginReactHooks,
        },
        settings: { react: { version: "detect" } },
        rules: {
            ...pluginReactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
        },
    },
]
