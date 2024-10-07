const nxPreset = require('@nx/jest/preset');
const tsPreset = require('ts-jest/presets/js-with-babel/jest-preset');

module.exports = {
  ...nxPreset,
  ...tsPreset,
  coverageReporters: ['text'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  transformIgnorePatterns: ['/node_modules/(?!@polkadot|@babel/runtime/helpers/esm/)'],
};
