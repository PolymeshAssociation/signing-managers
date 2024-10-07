module.exports = {
  displayName: 'hashicorp-vault-signing-manager',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.(ts)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/hashicorp-vault-signing-manager',
  restoreMocks: true,
};
