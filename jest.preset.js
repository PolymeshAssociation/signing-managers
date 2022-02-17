const nxPreset = require('@nrwl/jest/preset');
const tsPreset = require('ts-jest/presets/js-with-babel/jest-preset');

module.exports = {
  ...nxPreset,
  ...tsPreset,
  transformIgnorePatterns: ['/node_modules/(?!@polkadot|@babel/runtime/helpers/esm/)'],
};
