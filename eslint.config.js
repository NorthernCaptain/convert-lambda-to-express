const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const prettier = require('eslint-plugin-prettier');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js', 'dev-server/**']
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'es2020',
        sourceType: 'module',
        project: './tsconfig.test.json'
      },
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        setImmediate: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        clearImmediate: 'readonly',
        NodeJS: 'readonly',
        Console: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettier,
      import: importPlugin
    },
    rules: {
      // ESLint recommended rules
      ...eslint.configs.recommended.rules,

      // base eslint rules
      curly: 'error',
      indent: 'off',
      semi: ['error', 'always'],
      'no-cond-assign': ['error', 'always'],
      'init-declarations': 'off',
      'no-console': 'error',
      eqeqeq: 'error',
      'no-promise-executor-return': 'error',
      'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-optional-chaining': 'error',
      'require-atomic-updates': 'error',
      'array-callback-return': 'error',
      'no-prototype-builtins': 'off',
      'require-await': 'error',
      'no-var': 'error',
      'no-unused-vars': 'off',

      // eslint & typescript-eslint rule pairs
      'no-throw-literal': 'off',
      '@typescript-eslint/only-throw-error': 'error',
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',

      // typescript-eslint rules
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/no-dynamic-delete': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksConditionals: true, checksVoidReturn: true }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false
        }
      ],
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // import rules
      'import/no-unresolved': 'off',
      'import/first': 'error',

      // prettier
      'prettier/prettier': 'error'
    }
  }
];
