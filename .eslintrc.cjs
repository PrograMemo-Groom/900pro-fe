module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: ['@typescript-eslint', 'react', 'prettier', 'import', 'jsx-a11y'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:import/recommended',
      'plugin:prettier/recommended',
    ],
    rules: {
      'prettier/prettier': ['error'],
      'react/react-in-jsx-scope': 'off', // React 17+에서는 필요 없음
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
  