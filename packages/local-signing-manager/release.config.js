/* eslint-disable no-undef */
const name = 'local-signing-manager';
const srcRoot = `packages/${name}`;
const pathToRepoRoot = '../..';

module.exports = {
  extends: `${pathToRepoRoot}/release.config.base.js`,
  pkgRoot: `${pathToRepoRoot}/dist/${srcRoot}`,
  tagFormat: name + '-v${version}',
  commitPaths: [
    `*`, // anything in this directory
  ],
};
