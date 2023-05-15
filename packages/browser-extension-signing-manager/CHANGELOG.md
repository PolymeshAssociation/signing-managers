# [1.4.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.3.0...@polymeshassociation/browser-extension-signing-manager@1.4.0) (2023-05-15)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 2.1.0 [skip ci] ([49a772a](https://github.com/PolymeshAssociation/signing-managers/commit/49a772a0427f674f65a62460f702ca01f7391c73))


### Features

* update polkadot deps to match latest polymesh SDK versions ([#40](https://github.com/PolymeshAssociation/signing-managers/issues/40)) ([dae9908](https://github.com/PolymeshAssociation/signing-managers/commit/dae99085a3c691bcc7a4ea2b0fe3b753f52c07a5))

# [1.3.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.2.1...@polymeshassociation/browser-extension-signing-manager@1.3.0) (2023-04-03)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 2.0.0 [skip ci] ([f77c44a](https://github.com/PolymeshAssociation/signing-managers/commit/f77c44af6c8559d48ce09f8301ceb7a581de07b5))


### Features

* **browser-extension-signing-manager:** add support for multiple account types while creating browser signing manager ([adadfc0](https://github.com/PolymeshAssociation/signing-managers/commit/adadfc0fe3427ad945fd0e343103ff2051cf0bec))


### BREAKING CHANGES

* **browser-extension-signing-manager:** - `setAccountType` has been renamed to `setAccountTypes` and takes
`KeypairType[]` as parameter
- `accountType` param of `create` method of `BrowserExtensionSigningManger` has been changed to
`accountTypes` of type `KeypairType[]`

## [1.2.1](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.2.0...@polymeshassociation/browser-extension-signing-manager@1.2.1) (2023-04-02)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.4 [skip ci] ([39a4096](https://github.com/PolymeshAssociation/signing-managers/commit/39a4096d305262911cb34a4ac3ea8237aa833471))

# [1.2.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.1.5...@polymeshassociation/browser-extension-signing-manager@1.2.0) (2023-03-31)


### Features

* **browser-extension-signing-manager:** add `genesisHash` and `accountType` as optional parameters to `create` method ([bac1ff8](https://github.com/PolymeshAssociation/signing-managers/commit/bac1ff832ea3f9d140f003cdc3210624f2f57ff7))
* **browser-extension-signing-manager:** add `getCurrentNetwork` method ([b5bf260](https://github.com/PolymeshAssociation/signing-managers/commit/b5bf26087f2f03c61961039fe1fc36154f3b31d5))
* **browser-extension-signing-manager:** add optional `ss58Format` arg while creation ([d2ec62d](https://github.com/PolymeshAssociation/signing-managers/commit/d2ec62d1a840b7ceda8d66b78d9b58e68e6e1c7f))
* **browser-extension-signing-manager:** modify `onNetworkChange` to handle newtork agnositc extensions ([7a64a98](https://github.com/PolymeshAssociation/signing-managers/commit/7a64a988018dea3e7b0a7152ef537cd4b17f21e3))
* **browser-extension-signing-manager:** multiple extensions support ([cfb05c2](https://github.com/PolymeshAssociation/signing-managers/commit/cfb05c2bfd47f11d700e425d8d9b79b71ec5f4bf))

## [1.1.5](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.1.4...@polymeshassociation/browser-extension-signing-manager@1.1.5) (2023-03-17)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.3 [skip ci] ([124fade](https://github.com/PolymeshAssociation/signing-managers/commit/124fade2e5a5e2b26ea8370f889f662dd07d1d39))


### Documentation

* rename `sdk` to `polymesh` for the variable name in the examples ([#35](https://github.com/PolymeshAssociation/signing-managers/issues/35)) ([9dbe040](https://github.com/PolymeshAssociation/signing-managers/commit/9dbe0407329afe539bebc159febbebde35fbd967))

## [1.1.4](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.1.3...@polymeshassociation/browser-extension-signing-manager@1.1.4) (2023-03-17)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.2 [skip ci] ([f7f6445](https://github.com/PolymeshAssociation/signing-managers/commit/f7f6445a9a56b96a8bc1e70860f4ae9c3fe34f8c))
* main field in package.json to reference index.js correctly ([#36](https://github.com/PolymeshAssociation/signing-managers/issues/36)) ([66e8c44](https://github.com/PolymeshAssociation/signing-managers/commit/66e8c44ecc306b168a17e382b95996afa5853b8e))

## [1.1.3](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.1.2...@polymeshassociation/browser-extension-signing-manager@1.1.3) (2023-01-17)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.1 [skip ci] ([c18fb9e](https://github.com/PolymeshAssociation/signing-managers/commit/c18fb9e2f93a1a68553f2064d6a5a6949458babc))
* use shared signed extensions to prevent StoreCallMetadata warning ([#30](https://github.com/PolymeshAssociation/signing-managers/issues/30)) ([db6e15a](https://github.com/PolymeshAssociation/signing-managers/commit/db6e15a2ae25ff97b749a292940ba9f12a37acdb))

## [1.1.2](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.1.1...@polymeshassociation/browser-extension-signing-manager@1.1.2) (2023-01-16)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.0 [skip ci] ([cce05bd](https://github.com/PolymeshAssociation/signing-managers/commit/cce05bdb71127d5bf2a17f9c2d75191c066b2511))

## [1.1.1](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.1.0...@polymeshassociation/browser-extension-signing-manager@1.1.1) (2022-10-13)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.1.1 [skip ci] ([176af64](https://github.com/PolymeshAssociation/signing-managers/commit/176af644a76a1cd43e8717100d08c250bf748ceb))


### Documentation

* move nx attribution to bottom of README to improve readability ([#20](https://github.com/PolymeshAssociation/signing-managers/issues/20)) ([dd29e9b](https://github.com/PolymeshAssociation/signing-managers/commit/dd29e9b32a07a73834d0c77d38aafe34e8e288ed))

# [1.1.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/browser-extension-signing-manager@1.0.0...@polymeshassociation/browser-extension-signing-manager@1.1.0) (2022-08-10)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.1.0 [skip ci] ([7363fe5](https://github.com/PolymeshAssociation/signing-managers/commit/7363fe5dfe43fe686dae3d7f0c5a14d2cf1702be))


### Features

* use association npm for dependencies ([64ac247](https://github.com/PolymeshAssociation/signing-managers/commit/64ac247ffc67fdd359bf1da73ad2df39d0b536ad))

# 1.0.0 (2022-06-13)


### Bug Fixes

* **browser-extension-signing-manager,hashicorp-vault-signing-manager:** test not using nx github action ([0212f80](https://github.com/PolymathNetwork/signing-managers/commit/0212f809202c0f21fa57ea3bfbf181cd27af72b2))
* **browser-extension-signing-manager:** :arrow_up: update @polymathnetwork/signing-manager-types to 1.0.2 [skip ci] ([923e011](https://github.com/PolymathNetwork/signing-managers/commit/923e01195c5956f527ebb301cb524cc9b57e66c5))
* **browser-extension-signing-manager:** :arrow_up: update @polymathnetwork/signing-manager-types to 1.0.3 [skip ci] ([ed09c68](https://github.com/PolymathNetwork/signing-managers/commit/ed09c6899b5e77e526b81895628cf8071149d9bd))
* **browser-extension-signing-manager:** :arrow_up: update @polymathnetwork/signing-manager-types to 2.0.0 [skip ci] ([83bc1e2](https://github.com/PolymathNetwork/signing-managers/commit/83bc1e24550ffa2ca980c547ae71cf85a26f903d))
* **browser-extension-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.0.0 [skip ci] ([ce1b4ce](https://github.com/PolymathNetwork/signing-managers/commit/ce1b4ce35dcc83b98d12973537a6ab67ec6f7680))
* bump all versions ([79307bb](https://github.com/PolymathNetwork/signing-managers/commit/79307bb7aa18ef8abdd94865da7eed53997fe267))
* bump versions ([af3a6dc](https://github.com/PolymathNetwork/signing-managers/commit/af3a6dc9336bfa5d9d5fbe14d91165d056567165))
* **hashicorp-vault-signing-manager,browser-extension-signing-manager:** bump version ([6fa1bb6](https://github.com/PolymathNetwork/signing-managers/commit/6fa1bb6ad185040503df0ab7965bf5df93c3fe2e))
* **hashicorp-vault-signing-manager,browser-extension-signing-manager:** test multi release ([7223adf](https://github.com/PolymathNetwork/signing-managers/commit/7223adf1e5027554d4c66cd3c156e11913f72d10))
* **local-signing-manager,browser-extension-signing-manager,hashicorp-vault-signing-manager:** use proper types version ([41ccc15](https://github.com/PolymathNetwork/signing-managers/commit/41ccc15678c2a017474d9eef64eaf4c47366ecf3))


### Documentation

* **browser-extension-signing-manager:** add project to root readme ([9398c59](https://github.com/PolymathNetwork/signing-managers/commit/9398c59e2d6173a0bc3fa3a6f6347396f6da8b7c))
* fix broken link in readme ([63b7274](https://github.com/PolymathNetwork/signing-managers/commit/63b7274e78b99a712d5a92c3add52f067ba2cec8))
* update contribution guidelines ([6abdf96](https://github.com/PolymathNetwork/signing-managers/commit/6abdf96151f69584824a050e0bef13de0338acde))


### Features

* **browser-extension-signing-manager:** implement the browser extension signing manager ([8c7e972](https://github.com/PolymathNetwork/signing-managers/commit/8c7e97206b251eda6e56f99326e1b6bf1c2a604d))
* **local-signing-manager,hashicorp-vault-signing-manager,browser-extension-signing-manager:** update polkadot peer deps ([2906b08](https://github.com/PolymathNetwork/signing-managers/commit/2906b088981de1e7a5f5e0041c2a06607fba5bfb))
* **local-signing-manager,hashicorp-vault-signing-manager,browser-extension-signing-manager:** update SDK peer deps ([830ab06](https://github.com/PolymathNetwork/signing-managers/commit/830ab06373d5e516aba8f8868682ccaae08886e0))
* release initial versions ([0c49e44](https://github.com/PolymathNetwork/signing-managers/commit/0c49e441b4e68df3a9cc3985b11ade0de0a0f2a3))


### BREAKING CHANGES

* **local-signing-manager,hashicorp-vault-signing-manager,browser-extension-signing-manager:** support SDK v15

# [1.2.0](https://github.com/PolymathNetwork/signing-managers/compare/@polymathnetwork/browser-extension-signing-manager@1.1.0...@polymathnetwork/browser-extension-signing-manager@1.2.0) (2022-05-31)


### Features

* **local-signing-manager,hashicorp-vault-signing-manager,browser-extension-signing-manager:** update polkadot peer deps ([2906b08](https://github.com/PolymathNetwork/signing-managers/commit/2906b088981de1e7a5f5e0041c2a06607fba5bfb))

# [1.1.0](https://github.com/PolymathNetwork/signing-managers/compare/@polymathnetwork/browser-extension-signing-manager@1.0.1...@polymathnetwork/browser-extension-signing-manager@1.1.0) (2022-05-30)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymathnetwork/signing-manager-types to 2.0.0 [skip ci] ([83bc1e2](https://github.com/PolymathNetwork/signing-managers/commit/83bc1e24550ffa2ca980c547ae71cf85a26f903d))


### Features

* **local-signing-manager,hashicorp-vault-signing-manager,browser-extension-signing-manager:** update SDK peer deps ([830ab06](https://github.com/PolymathNetwork/signing-managers/commit/830ab06373d5e516aba8f8868682ccaae08886e0))


### BREAKING CHANGES

* **local-signing-manager,hashicorp-vault-signing-manager,browser-extension-signing-manager:** support SDK v15

## [1.0.1](https://github.com/PolymathNetwork/signing-managers/compare/@polymathnetwork/browser-extension-signing-manager@1.0.0...@polymathnetwork/browser-extension-signing-manager@1.0.1) (2022-03-04)


### Bug Fixes

* **browser-extension-signing-manager,hashicorp-vault-signing-manager:** test not using nx github action ([0212f80](https://github.com/PolymathNetwork/signing-managers/commit/0212f809202c0f21fa57ea3bfbf181cd27af72b2))
* **hashicorp-vault-signing-manager,browser-extension-signing-manager:** bump version ([6fa1bb6](https://github.com/PolymathNetwork/signing-managers/commit/6fa1bb6ad185040503df0ab7965bf5df93c3fe2e))
* **hashicorp-vault-signing-manager,browser-extension-signing-manager:** test multi release ([7223adf](https://github.com/PolymathNetwork/signing-managers/commit/7223adf1e5027554d4c66cd3c156e11913f72d10))
* **local-signing-manager,browser-extension-signing-manager,hashicorp-vault-signing-manager:** use proper types version ([41ccc15](https://github.com/PolymathNetwork/signing-managers/commit/41ccc15678c2a017474d9eef64eaf4c47366ecf3))

## [1.0.1](https://github.com/PolymathNetwork/signing-managers/compare/@polymathnetwork/browser-extension-signing-manager@1.0.0...@polymathnetwork/browser-extension-signing-manager@1.0.1) (2022-03-04)


### Bug Fixes

* **hashicorp-vault-signing-manager,browser-extension-signing-manager:** bump version ([6fa1bb6](https://github.com/PolymathNetwork/signing-managers/commit/6fa1bb6ad185040503df0ab7965bf5df93c3fe2e))
* **hashicorp-vault-signing-manager,browser-extension-signing-manager:** test multi release ([7223adf](https://github.com/PolymathNetwork/signing-managers/commit/7223adf1e5027554d4c66cd3c156e11913f72d10))
* **local-signing-manager,browser-extension-signing-manager,hashicorp-vault-signing-manager:** use proper types version ([41ccc15](https://github.com/PolymathNetwork/signing-managers/commit/41ccc15678c2a017474d9eef64eaf4c47366ecf3))

## [1.0.1](https://github.com/PolymathNetwork/signing-managers/compare/@polymathnetwork/browser-extension-signing-manager@1.0.0...@polymathnetwork/browser-extension-signing-manager@1.0.1) (2022-03-04)


### Bug Fixes

* **local-signing-manager,browser-extension-signing-manager,hashicorp-vault-signing-manager:** use proper types version ([41ccc15](https://github.com/PolymathNetwork/signing-managers/commit/41ccc15678c2a017474d9eef64eaf4c47366ecf3))

# 1.0.0 (2022-03-02)


### Bug Fixes

* **browser-extension-signing-manager:** :arrow_up: update @polymathnetwork/signing-manager-types to 1.0.2 [skip ci] ([923e011](https://github.com/PolymathNetwork/signing-managers/commit/923e01195c5956f527ebb301cb524cc9b57e66c5))
* **browser-extension-signing-manager:** :arrow_up: update @polymathnetwork/signing-manager-types to 1.0.3 [skip ci] ([ed09c68](https://github.com/PolymathNetwork/signing-managers/commit/ed09c6899b5e77e526b81895628cf8071149d9bd))
* bump all versions ([79307bb](https://github.com/PolymathNetwork/signing-managers/commit/79307bb7aa18ef8abdd94865da7eed53997fe267))
* bump versions ([af3a6dc](https://github.com/PolymathNetwork/signing-managers/commit/af3a6dc9336bfa5d9d5fbe14d91165d056567165))


### Documentation

* **browser-extension-signing-manager:** add project to root readme ([9398c59](https://github.com/PolymathNetwork/signing-managers/commit/9398c59e2d6173a0bc3fa3a6f6347396f6da8b7c))
* fix broken link in readme ([63b7274](https://github.com/PolymathNetwork/signing-managers/commit/63b7274e78b99a712d5a92c3add52f067ba2cec8))
* update contribution guidelines ([6abdf96](https://github.com/PolymathNetwork/signing-managers/commit/6abdf96151f69584824a050e0bef13de0338acde))


### Features

* **browser-extension-signing-manager:** implement the browser extension signing manager ([8c7e972](https://github.com/PolymathNetwork/signing-managers/commit/8c7e97206b251eda6e56f99326e1b6bf1c2a604d))
* release initial versions ([0c49e44](https://github.com/PolymathNetwork/signing-managers/commit/0c49e441b4e68df3a9cc3985b11ade0de0a0f2a3))
