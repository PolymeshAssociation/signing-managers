module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [
      2,
      'always',
      [
        '*',
        'types',
        'local-signing-manager',
        'browser-extension-signing-manager',
        'hashicorp-vault-signing-manager',
      ],
    ],
  },
};
