module.exports = {
	env: {
		browser: true,
		node: true,
		es2021: true,
	},
	plugins: [
		'@typescript-eslint',
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
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:prettier/recommended', // Must be last.
	],
	settings: {
		react: {
			version: "18.2",
		}
	},
	rules: {
		"react/no-unescaped-entities": "off",
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
