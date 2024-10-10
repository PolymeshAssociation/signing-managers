module.exports = {
  displayName: 'walletconnect-signing-manager',
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
  coverageDirectory: '../../coverage/packages/walletconnect-signing-manager',
  restoreMocks: true,
};
