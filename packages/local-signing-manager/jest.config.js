module.exports = {
  displayName: 'local-signing-manager',
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
  coverageDirectory: '../../coverage/packages/local-signing-manager',
  restoreMocks: true,
};
