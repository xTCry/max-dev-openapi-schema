import js from '@eslint/js';
import yml from 'eslint-plugin-yml';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...yml.configs.recommended,
  {
    files: ['**/*.yaml', '**/*.yml'],
    rules: {
      'yml/no-irregular-whitespace': 'off',
      'yml/plain-scalar': 'off',
    },
  },
);
