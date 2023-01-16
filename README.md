# SigningManagers

Monorepo for Polymesh SDK compatible Signing Managers.

## Projects

| Project                               | Package                                                                                                                                      | Version                                                                                                                                                                                                       | Links                                                                                                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Local Signing Manager**             | [`@polymeshassociation/local-signing-manager`](https://npmjs.com/package/@polymeshassociation/local-signing-manager)                         | [![npm latest version](https://img.shields.io/npm/v/@polymeshassociation/local-signing-manager/latest.svg)](https://www.npmjs.com/package/@polymeshassociation/local-signing-manager)                         | [![README](https://img.shields.io/badge/README--green.svg)](/packages/local-signing-manager/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/local-signing-manager/CHANGELOG.md)                         |
| **Browser Extension Signing Manager** | [`@polymeshassociation/browser-extension-signing-manager`](https://npmjs.com/package/@polymeshassociation/browser-extension-signing-manager) | [![npm latest version](https://img.shields.io/npm/v/@polymeshassociation/browser-extension-signing-manager/latest.svg)](https://www.npmjs.com/package/@polymeshassociation/browser-extension-signing-manager) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/browser-extension-signing-manager/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/browser-extension-signing-manager/CHANGELOG.md) |
| **Hashicorp Vault Signing Manager**   | [`@polymeshassociation/hashicorp-vault-signing-manager`](https://npmjs.com/package/@polymeshassociation/hashicorp-vault-signing-manager)     | [![npm latest version](https://img.shields.io/npm/v/@polymeshassociation/hashicorp-vault-signing-manager/latest.svg)](https://www.npmjs.com/package/@polymeshassociation/hashicorp-vault-signing-manager)     | [![README](https://img.shields.io/badge/README--green.svg)](/packages/hashicorp-vault-signing-manager/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/hashicorp-vault-signing-manager/CHANGELOG.md)     |
| **Fireblocks Signing Manager**        | [`@polymeshassociation/fireblocks-signing-manager`](https://npmjs.com/package/@polymeshassociation/fireblocks-signing-manager)               | [![npm latest version](https://img.shields.io/npm/v/@polymeshassociation/fireblocks-signing-manager/latest.svg)](https://www.npmjs.com/package/@polymeshassociation/fireblocks-signing-manager)               | [![README](https://img.shields.io/badge/README--green.svg)](/packages/fireblocks-signing-manager/README.md) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](/packages/fireblocks-signing-manager/CHANGELOG.md)               |

## Scripts

- Linting: `yarn lint <packageName>`
- Testing: `yarn test <packageName>`
- Building: `yarn build <packageName>`

If using on a unix type computer, all packages can be built (or test/lint) with:

```sh
ls packages | cut -d "_" -f 1 | xargs -I {} bash -c "yarn build} {}"
```

### Manual Testing

In order to test your code manually before releasing:

- Create a `sandbox/index.ts` file in the root of the package you want to test (i.e. `packages/local-signing-manager/sandbox/index.ts`). Write your test script there. The sandbox directory is ignored by git
- Run `yarn run-local <projectName>` in the terminal. This will run the sandbox script in a `ts-node` instance. If you wish to test browser related functionality, you can pass `--runInBrowser` to the command. This will open a browser tab with empty HTML and your sandbox script will run on it. Console output will be shown in the browser dev tools

Examples:

- `yarn run-local browser-extension-signing-manager --runInBrowser`
- `yarn run-local local-signing-manager`

You can also use nx commands directly with `yarn nx` (i.e. `yarn nx affected --targets=lint,test`)

## Contributing

Refer to the [Contribution Guidelines](CONTRIBUTING.md).

## License

This project was generated using [Nx](https://nx.dev) which is [MIT licensed](./LICENSE.MIT).

The project itself is [Apache 2.0 licensed](./LICENSE).
