import js from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import-x';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{ ignores: ['**/node_modules/**', '**/dist/**'] },

	js.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	react.configs['recommended-type-checked'],
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,

	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				project: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		settings: {
			'import-x/internal-regex': '^#',
			react: { version: '18.2' },
		},
		rules: {
			'import-x/first': 'error',
			'import-x/no-named-as-default-member': 'off',
			'import-x/order': [
				'error',
				{
					'newlines-between': 'always',
					groups: ['builtin', 'external', 'internal'],
					alphabetize: { order: 'asc', orderImportKind: 'asc' },
				},
			],
			'sort-imports': ['error', { ignoreDeclarationSort: true }],
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{ allowAny: true, allowNumber: true },
			],
		},
	},

	prettierRecommended,
	// This is disabled by prettier because some modes don't work with it;
	// re-enable since the default mode is fine.
	// https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#curly
	{ rules: { curly: 'error' } },
);
