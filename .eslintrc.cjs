module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // custom rules? contoh:
    'no-console': 'off',
    'no-underscore-dangle': 'off',
  },
};
