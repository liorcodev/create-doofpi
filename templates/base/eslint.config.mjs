import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['node_modules', 'dist', 'coverage']),
  js.configs.recommended,
  tseslint.configs.recommended,
  { rules: { '@typescript-eslint/no-namespace': 'off' } }
);
