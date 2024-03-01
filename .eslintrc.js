const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
	'env': {
		'node': true,
		'commonjs': true,
		'es2021': true
	},
	'globals': {
		'browser': true,
		'hs': true,
		'document': true,
		'window': true,
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended'
	],
	'ignorePatterns': [
		'node_modules/*',
		'playwright-report/*'
	],
	'overrides': [
		{
			'env': {
				'node': true
			},
			'files': [
				'.eslintrc.{js,cjs}'
			],
			'parserOptions': {
				'sourceType': 'script'
			}
		}
	],
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 'latest'
	},
	'plugins': [
		'@typescript-eslint'
	],
	'rules': {
		'indent': [
			'error',
			'tab'
		],
		'linebreak-style': [
			'error',
			'unix'
		],
		'quotes': [
			'error',
			'single'
		],
		'semi': [
			'error',
			'always'
		],

		'no-unused-expressions': [OFF],
		'no-useless-escape': [OFF],
		'no-extra-boolean-cast': [WARN],
		'no-extra-semi': [WARN],
		'no-func-assign': [ERROR],
		'no-inner-declarations': [OFF],
		'no-trailing-spaces': [WARN],
		'no-nested-ternary': [WARN], //Use ternary operator only if absolutely necessary
		'no-mixed-spaces-and-tabs': [WARN],

		//Typescipt specific rules
		'@typescript-eslint/no-unused-vars': [WARN],
		'@typescript-eslint/no-use-before-define': [ERROR],
		'@typescript-eslint/no-var-requires': [OFF]
	}
};
