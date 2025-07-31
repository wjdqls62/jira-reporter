import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import parser from '@typescript-eslint/parser';

export default tseslint.config(
    {
      ignores: [
        'dist',
        'build',
        'node_modules',
        '*.config.js',
        '*.config.ts',
        'vite.config.ts',
        'src/vite-env.d.ts',
      ],
    },
    {
      extends: [js.configs.recommended, ...tseslint.configs.recommended],
      files: ['**/*.{ts,tsx,js,jsx}'],
      languageOptions: {
        parser,
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
          ecmaVersion: 'latest',
          ecmaFeatures: {
            jsx: true,
          },
          sourceType: 'module'
        },
      },
      settings: {
        react: {
          version: 'detect',
        },
        'import/resolver': {
          typescript: {
            alwaysTryTypes: true,
            project: './tsconfig.json',
          },
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
          },
        },
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
      },
      plugins: {
        react,
        import: importPlugin,
        'react-hooks': reactHooks,
      },
      rules: {
        ...react.configs.recommended.rules,
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'react/jsx-uses-vars': 'error',
        'react/jsx-no-undef': 'error',
        'react/jsx-key': 'error',
        'react/display-name': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-unknown-property': 'error',
        'react/self-closing-comp': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // TypeScript
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',

        // JavaScript
        'no-var': 'error',
        'prefer-const': 'error',
        'no-console': 'warn',
        'no-undef': 'error',
        'no-unreachable': 'error',
        'no-constant-condition': 'error',
        'no-empty': 'error',
        'no-extra-semi': 'error',
        'no-func-assign': 'error',
        'no-irregular-whitespace': 'error',
        'no-unsafe-negation': 'error',

        // 코드 품질
        eqeqeq: 'error',
        curly: 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-return-assign': 'error',
        'no-self-compare': 'error',
        'no-throw-literal': 'error',
        'no-unused-expressions': 'error',

        // Import 순서 정렬 (충돌 방지를 위해 조정)
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              ['parent', 'sibling'],
              'index',
              'type',
            ],
            pathGroups: [
              {
                pattern: 'react',
                group: 'external',
                position: 'before',
              },
            ],
            pathGroupsExcludedImportTypes: ['react'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
            distinctGroup: false, // true에서 false로 변경
          },
        ],
        'import/newline-after-import': ['error', { count: 1 }],
        'no-duplicate-imports': 'off',
        'import/no-duplicates': ['error', { 'prefer-inline': true }],

        // sort-imports 규칙을 더 안전하게 조정
        'sort-imports': [
          'error',
          {
            ignoreCase: true,
            ignoreDeclarationSort: true, // import 순서는 import/order에 맡김
            ignoreMemberSort: false,
            memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
            allowSeparatedGroups: true, // false에서 true로 변경
          },
        ],

        'import/no-unresolved': 'off',
        'import/no-cycle': ['error', { maxDepth: 3 }],
        'import/no-self-import': 'error',
        'import/no-useless-path-segments': [
          'error',
          {
            noUselessIndex: true,
          },
        ],
        'import/prefer-default-export': 'off',
        'import/no-relative-packages': 'error',

        // type import 규칙을 더 안전하게 조정
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            disallowTypeAnnotations: false,
            fixStyle: 'separate-type-imports', // 추가: 더 안전한 변환
          },
        ],
      },
    },
);
