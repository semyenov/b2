import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  ignores: ['**/*.md'],
  rules: {
    // Allow Cyrillic alphabet ranges in regex (used for Russian word support)
    'regexp/no-obscure-range': 'off',
    // Bun provides global process
    'node/prefer-global/process': 'off',
    // Allow multiple statements per line for concise code
    'style/max-statements-per-line': 'off',
    // Allow unused vars starting with underscore
    'unused-imports/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    // Allow top-level await in entry point files (Bun supports it)
    'antfu/no-top-level-await': 'off',
    // Allow bracket notation for environment variables (TypeScript noPropertyAccessFromIndexSignature compatibility)
    'dot-notation': 'off',
  },
})
