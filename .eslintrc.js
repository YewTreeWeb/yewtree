module.exports = {
  root: true,
  // parser: 'babel-eslint',
  // parserOptions: {
  //   sourceType: 'module'
  // },
  env: {
    browser: true,
    jquery: true,
    es6: true
  },
  extends: ['airbnb-base', 'eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    "quotes": [2, "single", { "avoidEscape": true }],
    'prettier/prettier': 'error'
  }
};
