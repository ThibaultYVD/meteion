import js from '@eslint/js';
import globals from 'globals';

export default [
	js.configs.recommended,
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: globals.node,
		},
	},
	{
		files: ['**/*.test.js', '**/__tests__/**/*.js'],
		languageOptions: {
			globals: globals.jest,
		},
	},
];
