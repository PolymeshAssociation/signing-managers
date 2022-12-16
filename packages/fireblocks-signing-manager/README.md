# fireblocks signing manager

Polymesh SDK (v14+) compatible signing manager that interacts with a Fireblocks for signing.

## Usage

You will need to get a [Fireblocks](https://www.fireblocks.com/) Account and setup access for the API. This involves generating an API Key as well as a secret file.

In addition to getting the account, you will need to ask for Fireblocks to enable "Raw signing".

To use non default addresses, they must be "derived" first, before the SDK will recognize them as valid keys.

Note these derived keys will need to join as a Secondary key, or have a CDD claim made for them like any other key before they are fully usable on chain.

### Example

```ts
const signingManager = new FireblocksSigningManager({
  url: 'https://api.fireblocks.io',
  token: 'API_TOKEN',
  secretPath: './path/to/secret.key',
});

const sdk = await Polymesh.connect({
  signingManager,
  ...
})

const keyInfo = await signingManager.deriveAccount([44, 1, 1, 0, 0])

sdk.assets.createAsset(assetParams, { signingAccount: keyInfo.address })
```

### Derivation Path

The derivation path is a method for generating many keys out of a single secret. The Fireblocks API makes use of [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki).

When using this signing manager BIP-44 conventions should be used. Essentially the first number should always be `44`, the second should be `595` for mainnet, otherwise it should be `1`. The third should correspond with the Fireblocks Account ID that should sign. The last two numbers are a way to generate sub account under a particular account. They should be 0, unless you intend to use sub accounts.

The default key has a derivation path of on non mainnet chains as [44, 1, 0, 0, 0] and [44, 595, 0, 0, 0] for mainnet

Note, the `deriveAccount` method MUST be called before the SDK can sign with addresses that are not the default account.

## Running unit tests

Run `nx test fireblocks` to execute the unit tests via [Jest](https://jestjs.io).

### Info

This library was generated with [Nx](https://nx.dev).
