# hashicorp-vault-signing-manager

Polymesh SDK (v14+) compatible signing manager that interacts with a Hashicorp Vault for signing.

This library was generated with [Nx](https://nx.dev).

## Usage

```typescript
import { HashicorpVaultSigningManager } from '@polymathnetwork/hashicorp-vault-signing-manager';
import { Polymesh } from '@polymathnetwork/polymesh-sdk';

// setup
const signingManager = await HashicorpVaultSigningManager.create({
  // URL where the vault is hosted
  url: 'https://my-hosted-vault.io',
  // authentication token
  token: 'willNeverTell',
});

const sdk = await Polymesh.connect({
  nodeUrl,
  signingManager,
});
```
