module.exports = {
	env: {
		browser: true,
		node: true,
		es2021: true,
	},
	plugins: [
		'@typescript-eslint',
		'import',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: true,
		tsconfigRootDir: '.',
	},
	extends: [
		'eslint:recommended',
		'plugin:import/typescript',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:prettier/recommended', // Must be last.
	],
	settings: {
		'import/resolver': {
			typescript: true,
		},
		react: {
			version: "18.2",
		},
	},
	rules: {
		"import/first": "error",
		"import/no-duplicates": "error",
		"import/order": ["error", {
			"newlines-between": "always",
			groups: ['builtin', 'external', 'internal'],
			alphabetize: {
				order: 'asc',
				orderImportKind: 'asc',
			},
		 } ],
		"react/no-unescaped-entities": "off",
		"sort-imports": ["error", { ignoreDeclarationSort: true }],
		"@typescript-eslint/consistent-type-imports": "error",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-unsafe-argument": "off",
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/no-unsafe-call": "off",
		"@typescript-eslint/no-unsafe-member-access": "off",
		"@typescript-eslint/no-unsafe-return": "off",
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{ argsIgnorePattern: '^_' },
		],
		"@typescript-eslint/restrict-template-expressions": [
			"error",
			{ allowAny: true, allowNumber: true }
		],
	}
}
