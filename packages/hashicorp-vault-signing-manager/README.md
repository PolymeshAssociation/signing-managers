# hashicorp-vault-signing-manager

Polymesh SDK (v14+) compatible signing manager that interacts with a Hashicorp Vault for signing.

## Usage

```typescript
import { HashicorpVaultSigningManager } from '@polymeshassociation/hashicorp-vault-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

// setup
const signingManager = new HashicorpVaultSigningManager({
  // URL of the Vault's transit engine
  url: 'https://my-hosted-vault.io/v1/transit',
  // authentication token
  token: 'willNeverTell',
  // namespace value to be used with enterprise version of Vault. Read more - https://developer.hashicorp.com/vault/api-docs#namespaces
  namespace: 'admin',
});

const polymesh = await Polymesh.connect({
  nodeUrl,
  signingManager,
});
```

### Info

This library was generated with [Nx](https://nx.dev).
