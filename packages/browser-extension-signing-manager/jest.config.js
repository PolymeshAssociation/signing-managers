module.exports = {
  displayName: 'browser-extension-signing-manager',
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
  coverageDirectory: '../../coverage/packages/browser-extension-signing-manager',
  restoreMocks: true,
};
