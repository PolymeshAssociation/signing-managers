# SigningManagers

Monorepo for Polymesh SDK compatible Signing Managers.

This project was generated using [Nx](https://nx.dev).

## Projects

| Project                               | Package                                                                                                                              | Version                                                                                                                                                                                               | Links                                                                                                                                                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Local Signing Manager**             | [`@polymathnetwork/local-signing-manager`](https://npmjs.com/package/@polymathnetwork/local-signing-manager)                         | [![npm latest version](https://img.shields.io/npm/v/@polymathnetwork/local-signing-manager/latest.svg)](https://www.npmjs.com/package/@polymathnetwork/local-signing-manager)                         | [![README](https://img.shields.io/badge/README--green.svg)](/packages/local-signing-manager/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/local-signing-manager/CHANGELOG.md)                         |
| **Browser Extension Signing Manager** | [`@polymathnetwork/browser-extension-signing-manager`](https://npmjs.com/package/@polymathnetwork/browser-extension-signing-manager) | [![npm latest version](https://img.shields.io/npm/v/@polymathnetwork/browser-extension-signing-manager/latest.svg)](https://www.npmjs.com/package/@polymathnetwork/browser-extension-signing-manager) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/browser-extension-signing-manager/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/browser-extension-signing-manager/CHANGELOG.md) |

## Scripts

- Linting: `yarn lint <packageName>`
- Testing: `yarn test <packageName>`
- Building: `yarn build <packageName>`

### Manual Testing

In order to test your code manually before releasing:

- Create a `sandbox/index.ts` file in the root of the package you want to test (i.e. `packages/local-signing-manager/sandbox/index.ts`). Write your test script there. The sandbox directory is ignored by git
- Run `yarn run-local <projectName>` in the terminal. This will run the sandbox script in a `ts-node` instance. If you wish to test browser related functionality, you can pass `--runInBrowser` to the command. This will open a browser tab with empty HTML and your sandbox script will run on it. Console output will be shown in the browser dev tools

Examples:

- `yarn run-local browser-extension-signing-manager --runInBrowser`
- `yarn run-local local-signing-manager`

You can also use nx commands directly with `yarn nx` (i.e. `yarn nx affected --targets=lint,test`)
