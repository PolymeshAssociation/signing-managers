# fireblocks signing manager

Polymesh SDK (v14+) compatible signing manager that interacts with [Fireblocks](https://www.fireblocks.com/) for signing.

## Usage

You will need a Fireblocks Account and setup access for the API. This involves generating an API Key as well as a secret file.

You will need to ask for Fireblocks to enable "Raw signing" for your account. You should understand the risks and why raw signing is not enabled by default.

To use non default addresses, they must be "derived" first, before the SDK will recognize them as valid keys.

Note these derived keys will need to join as a Secondary key, or have a CDD claim made for them like any other key before they are fully usable on chain.

### Example

```ts
const signingManager = await FireblocksSigningManager.create({
  url: 'https://api.fireblocks.io',
  apiToken: 'API_TOKEN',
  secretPath: './path/to/secret.key',
  derivationPaths: [[44, 595, 0, 0, 0]], // derive mainnet key with the "default" Fireblocks account
});

const sdk = await Polymesh.connect({
  signingManager,
  ...
})

const keyInfo = await signingManager.deriveAccount([44, 595, 1, 0, 0]) // derive another key to sign with

/* Create CDD or join as a secondary key using the returned keyInfo.address */

sdk.assets.createAsset(assetParams, { signingAccount: keyInfo.address })
```

### Derivation Path

The derivation path is a method for generating many keys out of a single secret. The Fireblocks API makes use of [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki).

When using this signing manager BIP-44 conventions should be used. Essentially the first number should always be `44`, the second should be `595` for mainnet, otherwise it should be `1`. The third should correspond with the Fireblocks Account ID that should sign. The last two numbers are a way to generate sub account under a particular account. They should be 0, unless you intend to use sub accounts.

If an empty array of `derivationPaths` is provided, then no keys will be derived. If `derivationPaths` is `undefined` then the default test path will be used. i.e. `[44, 1, 0, 0, 0]`

Note, the `deriveAccount` method MUST be called with the appropriate path before the SDK will be able to sign for a given address, otherwise the address will not be found when attempting to sign.

## Running unit tests

Run `nx test fireblocks` to execute the unit tests via [Jest](https://jestjs.io).

### Info

This library was generated with [Nx](https://nx.dev).
