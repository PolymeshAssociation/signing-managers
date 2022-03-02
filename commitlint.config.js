module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      ['*', 'types', 'local-signing-manager', 'browser-extension-signing-manager'],
    ],
    'scope-empty': [2, 'never'],
  },
};
