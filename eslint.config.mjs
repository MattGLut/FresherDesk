import eslint from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: ['dist/**', 'node_modules/**', 'src/fluent/generated/**'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ['src/server/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'script',
            globals: {
                gs: 'readonly',
                current: 'readonly',
                previous: 'readonly',
                request: 'readonly',
                response: 'readonly',
                sn_ws: 'readonly',
                GlideSysAttachment: 'readonly',
                GlideRecord: 'readonly',
                GlideDateTime: 'readonly',
                Class: 'readonly',
                x_2058901_fresher: 'readonly',
            },
        },
    },
    {
        files: ['src/client/**/*.{ts,tsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
)
