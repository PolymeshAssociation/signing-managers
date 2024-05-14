module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'header-max-length': [2, 'always', 120],
    'scope-enum': [
      2,
      'always',
      [
        '*',
        'types',
        'local-signing-manager',
        'browser-extension-signing-manager',
        'hashicorp-vault-signing-manager',
        'approval-signing-manager',
        'fireblocks-signing-manager',
        'walletconnect-signing-manager',
      ],
    ],
  },
};
