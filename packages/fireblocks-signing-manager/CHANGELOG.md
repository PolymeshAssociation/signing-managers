# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## 1.0.0 (2024-10-08)


### ⚠ BREAKING CHANGES

* **fireblocks-signing-manager:** `secretPath` is now `secret`. To maintain old behavior use `fs.readFileSync` and
pass the secret to the constructor instead of the path

### Features

* **fireblocks-signing-manager:** allow secret to passed directly instead of requiring a file ([04a12e5](https://github.com/PolymeshAssociation/signing-managers/commit/04a12e52cad410f29c1a6793ccb5d0953c2e06b1))
* update polkadot dependencies ([d2f1883](https://github.com/PolymeshAssociation/signing-managers/commit/d2f18838ef44ea1090e6af2a2c70598f4ac2fd71))


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.0 [skip ci] ([d0340f2](https://github.com/PolymeshAssociation/signing-managers/commit/d0340f20dbc08802ff593fe3be6ca58420293d05))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.1 [skip ci] ([e19ac5a](https://github.com/PolymeshAssociation/signing-managers/commit/e19ac5a75ae875e90a937aef3e3b7ca80708d818))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.2 [skip ci] ([df156e1](https://github.com/PolymeshAssociation/signing-managers/commit/df156e16fd815a54576a4754c4f8873f289ec301))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.3 [skip ci] ([c7d6804](https://github.com/PolymeshAssociation/signing-managers/commit/c7d68048726c90285920d660b8fdcb6f1cd17d0a))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.4 [skip ci] ([3503b6b](https://github.com/PolymeshAssociation/signing-managers/commit/3503b6b13f2c457cf27e22584ea67e26a2222454))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 2.0.0 [skip ci] ([b0f6178](https://github.com/PolymeshAssociation/signing-managers/commit/b0f617870be00960fcf233a3e15a5a03321926c0))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 2.1.0 [skip ci] ([cb2cfcf](https://github.com/PolymeshAssociation/signing-managers/commit/cb2cfcf068fbae462ba906b299cc4a94842402ae))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.0.0 [skip ci] ([9e34f23](https://github.com/PolymeshAssociation/signing-managers/commit/9e34f238fe299a80a0faecd67f97abd46069aa0f))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.1.0 [skip ci] ([c6edcd9](https://github.com/PolymeshAssociation/signing-managers/commit/c6edcd94ca0db5b2f32cb2761039ea1d8a6078f7))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.2.0 [skip ci] ([6bb8973](https://github.com/PolymeshAssociation/signing-managers/commit/6bb897326b78bef14a70d8b8468885c7e2c3aaae))
* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.3.0 [skip ci] ([817eb5d](https://github.com/PolymeshAssociation/signing-managers/commit/817eb5d7100f620708c80245e9e90c74e1c8eeeb))
* main field in package.json to reference index.js correctly ([#36](https://github.com/PolymeshAssociation/signing-managers/issues/36)) ([66e8c44](https://github.com/PolymeshAssociation/signing-managers/commit/66e8c44ecc306b168a17e382b95996afa5853b8e))
* use shared signed extensions to prevent StoreCallMetadata warning ([#30](https://github.com/PolymeshAssociation/signing-managers/issues/30)) ([db6e15a](https://github.com/PolymeshAssociation/signing-managers/commit/db6e15a2ae25ff97b749a292940ba9f12a37acdb))

# [2.5.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@2.4.0...@polymeshassociation/fireblocks-signing-manager@2.5.0) (2024-05-14)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.3.0 [skip ci] ([817eb5d](https://github.com/PolymeshAssociation/signing-managers/commit/817eb5d7100f620708c80245e9e90c74e1c8eeeb))


### Features

* update polkadot dependencies ([d2f1883](https://github.com/PolymeshAssociation/signing-managers/commit/d2f18838ef44ea1090e6af2a2c70598f4ac2fd71))

# [2.4.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@2.3.0...@polymeshassociation/fireblocks-signing-manager@2.4.0) (2023-09-06)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.2.0 [skip ci] ([6bb8973](https://github.com/PolymeshAssociation/signing-managers/commit/6bb897326b78bef14a70d8b8468885c7e2c3aaae))


### Features

* update extension-dapp dependency to latest ([e5c5465](https://github.com/PolymeshAssociation/signing-managers/commit/e5c546571bfb7ffd63b25af357f9117ac6f20f92))

# [2.3.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@2.2.1...@polymeshassociation/fireblocks-signing-manager@2.3.0) (2023-09-06)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.1.0 [skip ci] ([c6edcd9](https://github.com/PolymeshAssociation/signing-managers/commit/c6edcd94ca0db5b2f32cb2761039ea1d8a6078f7))


### Features

* trigger update deps release ([d8b935a](https://github.com/PolymeshAssociation/signing-managers/commit/d8b935ab13c5909ceda4f9b2a93dd4145bd7fb84))

## [2.2.1](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@2.2.0...@polymeshassociation/fireblocks-signing-manager@2.2.1) (2023-08-21)


### Documentation

* **fireblocks-signing-manager:** update readme with example reading from file ([a4ebd43](https://github.com/PolymeshAssociation/signing-managers/commit/a4ebd43c2f54b7e79ce668a7704aa507741ee5d7))

# [2.2.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@2.1.0...@polymeshassociation/fireblocks-signing-manager@2.2.0) (2023-08-16)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 3.0.0 [skip ci] ([9e34f23](https://github.com/PolymeshAssociation/signing-managers/commit/9e34f238fe299a80a0faecd67f97abd46069aa0f))


### Features

* **fireblocks-signing-manager:** allow secret to passed directly instead of requiring a file ([04a12e5](https://github.com/PolymeshAssociation/signing-managers/commit/04a12e52cad410f29c1a6793ccb5d0953c2e06b1))


### BREAKING CHANGES

* **fireblocks-signing-manager:** `secretPath` is now `secret`. To maintain old behavior use `fs.readFileSync` and
pass the secret to the constructor instead of the path

# [2.1.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@2.0.0...@polymeshassociation/fireblocks-signing-manager@2.1.0) (2023-05-15)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 2.1.0 [skip ci] ([cb2cfcf](https://github.com/PolymeshAssociation/signing-managers/commit/cb2cfcf068fbae462ba906b299cc4a94842402ae))


### Features

* update polkadot deps to match latest polymesh SDK versions ([#40](https://github.com/PolymeshAssociation/signing-managers/issues/40)) ([dae9908](https://github.com/PolymeshAssociation/signing-managers/commit/dae99085a3c691bcc7a4ea2b0fe3b753f52c07a5))

# [2.0.0](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@1.0.6...@polymeshassociation/fireblocks-signing-manager@2.0.0) (2023-04-03)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 2.0.0 [skip ci] ([b0f6178](https://github.com/PolymeshAssociation/signing-managers/commit/b0f617870be00960fcf233a3e15a5a03321926c0))

## [1.0.6](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@1.0.5...@polymeshassociation/fireblocks-signing-manager@1.0.6) (2023-04-02)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.4 [skip ci] ([3503b6b](https://github.com/PolymeshAssociation/signing-managers/commit/3503b6b13f2c457cf27e22584ea67e26a2222454))

## [1.0.5](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@1.0.4...@polymeshassociation/fireblocks-signing-manager@1.0.5) (2023-03-17)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.3 [skip ci] ([c7d6804](https://github.com/PolymeshAssociation/signing-managers/commit/c7d68048726c90285920d660b8fdcb6f1cd17d0a))


### Documentation

* rename `sdk` to `polymesh` for the variable name in the examples ([#35](https://github.com/PolymeshAssociation/signing-managers/issues/35)) ([9dbe040](https://github.com/PolymeshAssociation/signing-managers/commit/9dbe0407329afe539bebc159febbebde35fbd967))

## [1.0.4](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@1.0.3...@polymeshassociation/fireblocks-signing-manager@1.0.4) (2023-03-17)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.2 [skip ci] ([df156e1](https://github.com/PolymeshAssociation/signing-managers/commit/df156e16fd815a54576a4754c4f8873f289ec301))
* main field in package.json to reference index.js correctly ([#36](https://github.com/PolymeshAssociation/signing-managers/issues/36)) ([66e8c44](https://github.com/PolymeshAssociation/signing-managers/commit/66e8c44ecc306b168a17e382b95996afa5853b8e))

## [1.0.3](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@1.0.2...@polymeshassociation/fireblocks-signing-manager@1.0.3) (2023-01-17)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.1 [skip ci] ([e19ac5a](https://github.com/PolymeshAssociation/signing-managers/commit/e19ac5a75ae875e90a937aef3e3b7ca80708d818))
* use shared signed extensions to prevent StoreCallMetadata warning ([#30](https://github.com/PolymeshAssociation/signing-managers/issues/30)) ([db6e15a](https://github.com/PolymeshAssociation/signing-managers/commit/db6e15a2ae25ff97b749a292940ba9f12a37acdb))

## [1.0.2](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@1.0.1...@polymeshassociation/fireblocks-signing-manager@1.0.2) (2023-01-16)


### Bug Fixes

* **fireblocks-signing-manager:** :arrow_up: update @polymeshassociation/signing-manager-types to 1.2.0 [skip ci] ([d0340f2](https://github.com/PolymeshAssociation/signing-managers/commit/d0340f20dbc08802ff593fe3be6ca58420293d05))

## [1.0.1](https://github.com/PolymeshAssociation/signing-managers/compare/@polymeshassociation/fireblocks-signing-manager@1.0.0...@polymeshassociation/fireblocks-signing-manager@1.0.1) (2022-12-21)


### Documentation

* **fireblocks-signing-manager:** improve README readability ([1bb4a92](https://github.com/PolymeshAssociation/signing-managers/commit/1bb4a92719e56e04f440f7299bd50dc4da8ab056))

# 1.0.0 (2022-12-20)


### Bug Fixes

* bump all versions ([79307bb](https://github.com/PolymeshAssociation/signing-managers/commit/79307bb7aa18ef8abdd94865da7eed53997fe267))
* bump versions ([af3a6dc](https://github.com/PolymeshAssociation/signing-managers/commit/af3a6dc9336bfa5d9d5fbe14d91165d056567165))


### Documentation

* fix broken link in readme ([63b7274](https://github.com/PolymeshAssociation/signing-managers/commit/63b7274e78b99a712d5a92c3add52f067ba2cec8))
* move nx attribution to bottom of README to improve readability ([#20](https://github.com/PolymeshAssociation/signing-managers/issues/20)) ([dd29e9b](https://github.com/PolymeshAssociation/signing-managers/commit/dd29e9b32a07a73834d0c77d38aafe34e8e288ed))
* update contribution guidelines ([6abdf96](https://github.com/PolymeshAssociation/signing-managers/commit/6abdf96151f69584824a050e0bef13de0338acde))


### Features

* release initial versions ([0c49e44](https://github.com/PolymeshAssociation/signing-managers/commit/0c49e441b4e68df3a9cc3985b11ade0de0a0f2a3))
* use association npm for dependencies ([64ac247](https://github.com/PolymeshAssociation/signing-managers/commit/64ac247ffc67fdd359bf1da73ad2df39d0b536ad))
