# approval-signing-manager

This library was generated with [Nx](https://nx.dev).

This signing manager was made with a specific API in which signatures for some transactions go through some kind of approval process. Some transaction may even require human approval which means the signing process may take a very long time in computer terms.

This signing manager will make a request for a signature, and will continue to poll until the signature is approved. Generally its recommended to use "immortal" transactions when using this signing manager (pass in `{immortal: true}` in transaction opts).

Generally its recommended to use "mortal" transactions in Substrate chains to mitigate the risk of replay attacks on Substrate chains. However the polymesh chain will never reap accounts, and thus mitigates the risk of replay attacks. We generally recommend mortal transactions, however since this signing manager introduces the possibility of significant delay, its better to use immortal transactions so they do not expire while waiting for approval.

If you were to use this, then you'd need to reconstruct the backing API. By looking at the types.ts file and some of the client code it should be relatively simple to get a compatible API. However its likely you'll use this as an example and make some modifications to the code.

## Usage

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

const sdk = await Polymesh.connect({
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
