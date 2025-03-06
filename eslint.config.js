// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
// @ts-ignore
import importPlugin from 'eslint-plugin-import';

export default tseslint.config({
  files: ['**/*.{ts,tsx}'],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
  ],
  rules: {
    'import/order': 'error',
  },
  // other configs...
});
