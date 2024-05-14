import type Client from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

import { WalletConnect, WalletConnectConfiguration } from './walletconnect';
import { WalletConnectSigner } from './walletconnect/signer';
import { WalletConnectSigningManager } from './walletconnect-signing-manager';

jest.mock('./walletconnect');

describe('WalletConnectSigningManager Class', () => {
  let config: WalletConnectConfiguration;
  let walletConnectMock: jest.Mocked<WalletConnect>;
  let walletConnectSignerMock: jest.Mocked<WalletConnectSigner>;
  let signingManager: WalletConnectSigningManager;

  const address12 = '2HFAAoz9ZGHnLL84ytDhVBXggYv4avQCiS5ajtKLudRhUFrh';
  const address42 = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

  beforeAll(() => {
    config = {
      projectId: '4fae85e642724ee66587fa9f37b997e2',
      metadata: {
        name: 'Polymesh Signing Manager Demo',
        description: 'Signing Manager Demo',
        url: 'https://polymesh.network',
        icons: [
          'https://assets-global.website-files.com/61c0a31b90958801836efe1b/62d08014db27c031ec24b6f6_polymesh-symbol.svg',
        ],
      },
      chainIds: ['polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16'],
      storageOptions: { database: 'testLocalDatabase' },
      handleConnectUri: jest.fn(),
      onSessionDelete: jest.fn(),
    } as WalletConnectConfiguration;
  });

  beforeEach(async () => {
    // Mock client and session
    const mockClient = {} as unknown as jest.Mocked<Client>;
    const mockSession = {
      peer: { metadata: { name: 'walletName' } },
    } as unknown as jest.Mocked<SessionTypes.Struct>;

    walletConnectSignerMock = new WalletConnectSigner(
      mockClient,
      mockSession
    ) as jest.Mocked<WalletConnectSigner>;

    walletConnectMock = {
      appName: 'testDApp',
      config: config,
      metadata: config.metadata,
      client: mockClient,
      session: mockSession,
      connect: jest.fn(),
      getAccounts: jest.fn().mockResolvedValue([{ address: address12 }]),
      signer: walletConnectSignerMock,
      subscribeAccounts: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<WalletConnect>;

    (WalletConnect as jest.Mock).mockImplementation(() => walletConnectMock);

    signingManager = await WalletConnectSigningManager.create({
      appName: 'testDApp',
      config,
      ss58Format: 42,
      genesisHash: 'someHash',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('method: create', () => {
    it('should create an instance of WalletConnectSigningManager', async () => {
      expect(walletConnectMock.connect).toHaveBeenCalled();
      expect(signingManager).toBeInstanceOf(WalletConnectSigningManager);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((signingManager as any)._ss58Format).toBe(42);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((signingManager as any)._genesisHash).toBe('someHash');
    });
  });

  describe('method: setSs58Format', () => {
    it('should set the SS58 format', () => {
      signingManager.setSs58Format(12);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((signingManager as any)._ss58Format).toBe(12);
    });
  });

  describe('method: setGenesisHash', () => {
    it('should set the genesis hash and update the chainId in signer', () => {
      signingManager.setGenesisHash(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((signingManager as any)._genesisHash).toBe(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      expect(walletConnectSignerMock.chainId).toBe('polkadot:1234567890abcdef1234567890abcdef');
    });
  });

  describe('method: getAccounts', () => {
    it('should return all accounts held in the wallet, respecting the SS58 format', async () => {
      const result = await signingManager.getAccounts();
      expect(result).toEqual([address42]);
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      signingManager = await WalletConnectSigningManager.create({
        appName: 'testDApp',
        config,
      });

      await expect(signingManager.getAccounts()).rejects.toThrow(
        "Cannot call 'getAccounts' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: getAccountsWithMeta', () => {
    it('should return all accounts with metadata, respecting the SS58 format', async () => {
      signingManager = await WalletConnectSigningManager.create({
        appName: 'testDApp',
        config,
        ss58Format: 42,
      });

      const result = await signingManager.getAccountsWithMeta();

      expect(result).toEqual([
        {
          address: address42,
          meta: { genesisHash: undefined, name: undefined, source: 'walletName' },
          type: undefined,
        },
      ]);
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      const signingManager = await WalletConnectSigningManager.create({
        appName: 'testDApp',
        config,
      });

      await expect(signingManager.getAccountsWithMeta()).rejects.toThrow(
        "Cannot call 'getAccountsWithMeta' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: getExternalSigner', () => {
    it('should return the signer object', () => {
      const signer = signingManager.getExternalSigner();
      expect(signer).toBeInstanceOf(WalletConnectSigner);
    });

    it('should throw an error if the signer is not connected', () => {
      walletConnectMock.signer = undefined;
      expect(() => signingManager.getExternalSigner()).toThrow(
        'WalletConnect signer not connected'
      );
    });
  });

  describe('method: onAccountChange', () => {
    it('should pass the new accounts to the callback, respecting the SS58 format', () => {
      const accounts = [{ address: address12 }];
      (walletConnectMock.subscribeAccounts as jest.Mock).mockImplementation(cb => {
        cb(accounts);
      });

      const callback = jest.fn();
      signingManager.onAccountChange(callback, false);

      expect(callback).toHaveBeenCalledWith([address42]);
    });

    it('should pass the new accountsWithMetadata to the callback, respecting the SS58 format', () => {
      const accounts = [{ address: address12 }];
      (walletConnectMock.subscribeAccounts as jest.Mock).mockImplementation(cb => {
        cb(accounts);
      });

      const callback = jest.fn();
      signingManager.onAccountChange(callback, true);

      expect(callback).toHaveBeenCalledWith([
        {
          address: address42,
          meta: {
            genesisHash: undefined,
            name: undefined,
            source: 'walletName',
          },
          type: undefined,
        },
      ]);
    });

    it('should use default wallet name if a session is not provided', () => {
      const accounts = [{ address: address12 }];
      walletConnectMock.session = undefined;
      (walletConnectMock.subscribeAccounts as jest.Mock).mockImplementation(cb => {
        cb(accounts);
      });

      const callback = jest.fn();
      signingManager.onAccountChange(callback, true);

      expect(callback).toHaveBeenCalledWith([
        {
          address: address42,
          meta: {
            genesisHash: undefined,
            name: undefined,
            source: 'walletConnect',
          },
          type: undefined,
        },
      ]);
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      signingManager = await WalletConnectSigningManager.create({
        appName: 'testDApp',
        config,
      });
      const accounts = [{ address: address12 }];
      (walletConnectMock.subscribeAccounts as jest.Mock).mockImplementation(cb => {
        cb(accounts);
      });

      expect(() => signingManager.onAccountChange(() => console.log('12345678'))).toThrow(
        "Cannot call 'onAccountChange callback' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: disconnect', () => {
    it('should disconnect the wallet session', async () => {
      await signingManager.disconnect();
      expect(walletConnectMock.disconnect).toHaveBeenCalled();
    });
  });

  describe('method: isConnected', () => {
    it('should return the connection status', () => {
      const isConnected = signingManager.isConnected();
      expect(isConnected).toBe(true);
    });
  });
});
