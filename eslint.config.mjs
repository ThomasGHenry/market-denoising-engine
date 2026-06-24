import nx from '@nx/eslint-plugin';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/react'],
  {
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:web', 'scope:domain', 'scope:shared'],
            },
            {
              sourceTag: 'scope:domain',
              onlyDependOnLibsWithTags: ['scope:domain', 'scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/domain/**/*.ts', 'packages/domain/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@prisma/client', '@prisma/client/*'],
              message:
                'Direct Prisma client imports are forbidden in packages/domain. Use @template/db types only.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**', '.nx/**'],
  },
];
