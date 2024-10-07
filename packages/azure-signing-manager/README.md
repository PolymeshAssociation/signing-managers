# azure-signing-manager

Polymesh SDK compatible signing manager. This allows Polymesh transactions to be signed with keys in an Microsoft Azure [key vault](https://azure.microsoft.com/en-us/products/key-vault). The keys must be "EC" type and use curve "P-256K". The signing manager will ignore any other type.

## Usage

```typescript
import { AzureSigningManager } from '@polymeshassociation/azure-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';

// defaults to constructing `new DefaultAzureCredential()` for credential
const signingManager = new AzureSigningManager({
  keyVaultUrl: 'https://somekeyvault.vault.azure.net/',
});

const polymesh = await Polymesh.connect({
  nodeUrl,
  signingManager,
});

const newKey = await signingManager.createKey('myKey') // keys can be created in the Azure UI or CLI as well
console.log('created key with address: ', newKey.address) // address is the primary way of specifying public keys on Polymesh
```

Details about the default credential behavior can be found [here](https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest#@azure-identity-defaultazurecredential-constructor). You can optionally pass in your own credential object and it will be used instead.


## Performance Note (for 1000+ keys)

The current implementation enumerates all possible keys and their versions to construct an index of public key to key name lookup. As an integrator you will likely have this data already indexed. If N+1 style performance issues are a concern the constructor can be extended where a lookup you provide can be called. e.g.

```ts
interface {
  getKeyName(address: string): Promise<{ name: string; version: string }>
}
```

For now it is recommended to have a key vault dedicated to Polymesh keys and to keep them to a limited number. Please open an issue if you desire thousands of keys stored in an Azure key vault.

## Running unit tests

Run `nx test azure-signing-manager` to execute the unit tests via [Jest](https://jestjs.io).

This library was generated with [Nx](https://nx.dev).