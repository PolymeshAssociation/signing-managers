# local-signing-manager

Polymesh SDK (v14+) compatible signing manager that stores private keys in memory.

This library was generated with [Nx](https://nx.dev).

## Usage

```typescript
import { LocalSigningManager } from '@polymeshassociation/local-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

// setup
const signingManager = await LocalSigningManager.create({
  accounts: [
    {
      mnemonic: 'secret words will not be shared',
    },
  ],
});

const sdk = await Polymesh.connect({
  nodeUrl,
  signingManager,
});
```
