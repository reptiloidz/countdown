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
			extends: ['plugin:@html-eslint/recommended'],
		},
	],
	rules: {
		'@html-eslint/indent': ['error', 'tab'],
	},
};
