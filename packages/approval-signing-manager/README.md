# approval-signing-manager

This signing manager was made with a specific API in which signatures for some transactions go through some kind of approval process. Some transaction may even require human approval which means the signing process may take a very long time in computer terms.

This signing manager makes a request for a signature, and continues to poll until the transaction is approved.

By default the SDK generates transactions that are valid for roughly 5 minutes. If the approval process may take longer, then "immortal" transactions should be used by passing in `{immortal: true}` in the transaction opts.

Substrate chains recommend the use of "mortal" transactions to mitigate the risk of replay attacks. However, the Polymesh chain will never reap accounts, and thus mitigates the risk of replay attacks.

## Usage

Note: To use this as is, the remote signing service would need to be reimplemented. The `types.ts` and the "client" source, it should be relatively simple to reconstruct. This has been published to as an example for similar integrations

```ts
import { ApprovalSigningManager } from '@polymeshassociation/approval-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

// setup
const signingManager = new ApprovalSigningManager({
  // URL of the backing API
  url: 'https://example.com',
  apiClientId: 'someId',
  apiKey: 'someSecret',
  // seconds to wait between polling for each pending transaction signature
  pollingInterval: 60,
});

const polymesh = await Polymesh.connect({
  nodeUrl,
  signingManager,
});
```

## Transaction lifetimes

By default the Polymesh SDK transaction are valid for ~5 minutes after they are created. It is recommended to set the procedure opts to use "immortal" transactions

```ts
sdk.assets.createAsset(args, { mortality: { immortal: true } });
```

## Running unit tests

Run `nx test approval-signing-manager` to execute the unit tests via [Jest](https://jestjs.io).

### Info

This library was generated with [Nx](https://nx.dev).
