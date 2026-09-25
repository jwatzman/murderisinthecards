import js from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import-x';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{ ignores: ['**/node_modules/**', '**/dist/**'] },

	js.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	react.configs['recommended-type-checked'],

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
		plugins: {
			'import-x': importPlugin,
			'no-relative-import-paths': noRelativeImportPaths,
		},
		settings: {
			'import-x/internal-regex': '^#',
			react: { version: '19.3' },
		},
		rules: {
			eqeqeq: 'error',
			'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
			'import-x/first': 'error',
			'import-x/no-duplicates': 'error',
			'import-x/order': [
				'error',
				{
					'newlines-between': 'always',
					groups: ['builtin', 'external', 'internal'],
					alphabetize: { order: 'asc', orderImportKind: 'asc' },
				},
			],
			'no-relative-import-paths/no-relative-import-paths': 'error',
			'sort-imports': ['error', { ignoreDeclarationSort: true }],
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-shadow': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/return-await': ['error', 'always'],
			'@typescript-eslint/require-await': 'off',
		},
	},

	prettierRecommended,
	// This is disabled by prettier because some modes don't work with it;
	// re-enable since the default mode is fine.
	// https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#curly
	{ rules: { curly: 'error' } },
);
