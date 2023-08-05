module.exports = {
	parserOptions: {
		ecmaVersion: 2021,
		sourceType: 'module',
	},
	plugins: ['@html-eslint'],
	overrides: [
		{
			files: ['*.html'],
			parser: '@html-eslint/parser',
		},
	],
	rules: {
		'@html-eslint/indent': ['error', 'tab'],
		'@html-eslint/require-doctype': 'off',
	},
};
