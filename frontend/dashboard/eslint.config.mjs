import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{ts,tsx}'];

export default tseslint.config(
  {
    ignores: ['.next/**', 'node_modules/**', 'scripts/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: sourceFiles,
    rules: {
      'no-empty': ['error', { allowEmptyCatch: false }],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Use a typed feature API module built on src/shared/api/client.ts.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message: 'Use the central typed dashboard API client instead of axios.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/shared/api/**/*.{ts,tsx}',
      'src/features/*/api/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-globals': 'off',
    },
  },
);
