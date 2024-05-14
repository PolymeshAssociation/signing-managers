# WalletConnect Signing Manager

This library provides a Polymesh SDK-compatible signing manager that enables interaction with a WalletConnect-compatible wallet, such as a remote mobile wallet.

The WalletConnect signing manager is designed to have a similar API to the Browser Extension Signing Manager to simplify the effort for an integration to support both options.

## Creating a Signing Manager

To use the `WalletConnectSigningManager`, follow these steps:

### 1. Import the Necessary Modules

- Import the `WalletConnectSigningManager` class from the `@polymeshassociation/walletconnect-signing-manager` package.
- Import the `Polymesh` class from the `@polymeshassociation/polymesh-sdk` package.

```typescript
import { WalletConnectSigningManager } from '@polymeshassociation/walletconnect-signing-manager';
import { Polymesh } from '@polymeshassociation/polymesh-sdk';
```

### 2. Define WalletConnect Configuration

Define the `walletConnectConfiguration` object with the necessary parameters.

Provide details for each configuration parameter:

- `projectId`: Obtain from [WalletConnect](https://cloud.walletconnect.com/).
- `relayUrl` (optional): Override the default relay endpoint.
- `metadata` (optional): Metadata displayed in the wallet connecting to your app.
- `chainIds`: CASA CAIP-2 representation of the chain. Polymesh instances begin with 'polkadot:' + first 32 bytes of the genesis hash. The connected wallet must support the provided chain ID.
- `optionalChainIds` (optional): Additional chain IDs. Not mandatory for wallet support.
- `modalOptions` (optional): WalletConnect modal configuration parameters. Refer to [WalletConnect documentation](https://docs.walletconnect.com/advanced/walletconnectmodal/options) for options.
- `handleConnectUri` (optional): Callback to handle the WalletConnect URI. Runs only once when the URI is generated. If provided, the WalletConnect modal will not be displayed.
- `onSessionDelete` (optional): Callback function to run when a WalletConnect session is deleted.

```typescript
const walletConnectConfiguration = {
  projectId: '427...',
  relayUrl: 'wss://relay.walletconnect.org',
  metadata: {
    name: 'My App',
    description: 'App for interacting with the Polymesh Blockchain',
    url: 'https://example.com',
    icons: ['https://walletconnect.com/walletconnect-logo.png'],
  },
  chainIds: ['polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16'],
  optionalChainIds: ['polkadot:2ace05e703aa50b48c0ccccfc8b424f7'],
  modalOptions: {
    // See WalletConnect documentation for options
  },
  handleConnectUri: uri => {
    // Code to handle the WalletConnect URI.
    // Note: If provided, the WalletConnect modal will not be displayed.
  },
  onSessionDelete: () => {
    // Code to run on session delete.
  },
};
```

### 3. Create a WalletConnect Connection

- Use the `create()` method of the `WalletConnectSigningManager` class to create a connection.
- Pass the `walletConnectConfiguration` object and other optional parameters:
  - `appName`: Name of the dApp attempting to connect to the extension.
  - `ss58Format` (optional): SS58 prefix for encoding addresses. When the SDK connects to a node this gets set to the chain specific.
  - `genesisHash` (optional): Genesis hash of the target chain. This is required only when signing raw data to configure the chainId for. When signing transactions prepared by the SDK the chainId will be derived from the genesisHash contained in the transaction payload.

When called, the generated URI or QR code must be used to make the WalletConnect connection before the signing manager is returned.

```typescript
const signingManager = await WalletConnectSigningManager.create({
  config: walletConnectConfiguration,
  appName: 'My App',
  ss58Format: 12, // (optional)
  genesisHash: '0x6fbd74e5e1d0a61d52ccfe9d4adaed16dd3a7caa37c6bc4d0c2fa12e8b2f4063', // (optional)
});
```

### 4. Attach the Signing Manager to the Polymesh SDK

- Connect the `signingManager` instance to the Polymesh SDK using the `Polymesh.connect()` method.

```typescript
const polymesh = await Polymesh.connect({
  nodeUrl,
  signingManager,
});
```

Now you have successfully created a `WalletConnectSigningManager` instance and attached it to the Polymesh SDK, allowing interaction with a WalletConnect-compatible wallet.

## Additional Methods

### Setting SS58 Format and Genesis Hash

Use the `setSs58Format()` method and `setGenesisHash()` method to set the SS58 prefix and genesis hash, respectively.

```typescript
signingManager.setSs58Format(42);
signingManager.setGenesisHash('0x123456789abcdef');
```

### Getting Accounts

To retrieve accounts from the connected wallet, use the `getAccounts()` or `getAccountsWithMeta()` methods.

```typescript
const accounts = await signingManager.getAccounts();
const accountsWithMeta = await signingManager.getAccountsWithMeta();
```

### Getting External Signer

Use the `getExternalSigner()` method to get a `WalletConnectSigner` object that uses connected walletConnect accounts for signing.

```typescript
const externalSigner = signingManager.getExternalSigner();
```

### Subscribing to Account Changes

Subscribe to changes in the connected wallet's accounts using the `onAccountChange()` method.

```typescript
const unsubscribe = signingManager.onAccountChange(accounts => {
  // Handle account change event
});
```

### Disconnecting and Checking Connection Status

Use the `disconnect()` method to disconnect the connected WalletConnect session, and `isConnected()` method to check the connection status.

```typescript
await signingManager.disconnect();
const isConnected = signingManager.isConnected();
```

## Info

This library was generated with [Nx](https://nx.dev).
