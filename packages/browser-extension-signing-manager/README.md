# browser-extension-signing-manager

Polymesh SDK (14+) compatible signing manager that manages accounts and signs via a polkadot compatible browser wallet extension.

## Usage

```typescript
import { BrowserExtensionSigningManager } from '@polymeshassociation/browser-extension-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

// setup. This call will prompt the user if they haven't authorized the dApp before
const signingManager = await BrowserExtensionSigningManager.create({
  appName: 'my-dApp',
  extensionName: 'polywallet', // this is optional, defaults to 'polywallet'
});

const sdk = await Polymesh.connect({
  nodeUrl,
  signingManager,
});

// callback is called whenever the extension Accounts change
signingManager.onAccountChange(newAccounts => {
  // change SDK's signing account, reload the page, do whatever
});

// callback is called whenever the extension's selected network changes
signingManager.onNetworkChange(newNetwork => {
  // act accordingly
});
```

### Info

This library was generated with [Nx](https://nx.dev).
