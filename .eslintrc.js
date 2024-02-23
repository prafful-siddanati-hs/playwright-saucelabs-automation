const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es2021': true
	},
	'extends': [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended'
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

		//Typescipt specific rules
		'@typescript-eslint/no-unused-vars': [WARN],
		'@typescript-eslint/no-use-before-define': [ERROR],
		'@typescript-eslint/no-var-requires': [OFF]
	}
};
