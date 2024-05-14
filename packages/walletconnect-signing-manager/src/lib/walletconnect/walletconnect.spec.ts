import Client, { SignClient } from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

import { WalletConnectSigner } from './signer';
import type { WalletConnectConfiguration } from './types';
import { POLYMESH_CHAIN_ID, WalletConnect, WC_VERSION } from './walletconnect';

jest.mock('@walletconnect/sign-client');

describe('WalletConnect', () => {
  let config: WalletConnectConfiguration;
  let walletConnect: WalletConnect;
  let clientMock: jest.Mocked<Client>;
  let sessionMock: SessionTypes.Struct;

  beforeEach(() => {
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
      chainIds: [POLYMESH_CHAIN_ID],
      storageOptions: { database: 'testLocalDatabase' },
      handleConnectUri: jest.fn(),
      onSessionDelete: jest.fn(),
    };

    sessionMock = {
      topic: '0fad0dec80bf1226eb1646defde76536a86f0a06e604bd28f98c08c564b0e035',
      relay: { protocol: 'irn' },
      expiry: Math.floor(Date.now() / 1000) + 1000,
      namespaces: {
        polkadot: {
          accounts: [
            'polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16:5Ci1xTypyBSv1kN5kS5zzFbm1fcfyY6RCqNsDieeYhFjTtVj',
          ],
          methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
          events: ['chainChanged', 'accountsChanged'],
          chains: ['polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16'],
        },
      },
      acknowledged: true,
      pairingTopic: '0bea69835975b2e1e9b0653557371572c7a9a435a4d99d00fc888f42b9982db9',
      requiredNamespaces: {
        polkadot: {
          chains: ['polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16'],
          methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
          events: ['chainChanged', 'accountsChanged'],
        },
      },
      optionalNamespaces: {},
      controller: '886e9e42f7c650a21ec121a70f074a07d4f75937dead2a16de1d9ab0c0136d5b',
      self: {
        publicKey: '6c96551a13e944f472cf7b895fddbb00c9a7894c81988a837399f3c940510810',
        metadata: {
          name: 'Polymesh Signing Manager Demo',
          description: 'Signing Manager Demo',
          url: 'https://polymesh.network',
          icons: [
            'https://assets-global.website-files.com/61c0a31b90958801836efe1b/62d08014db27c031ec24b6f6_polymesh-symbol.svg',
          ],
        },
      },
      peer: {
        publicKey: '886e9e42f7c650a21ec121a70f074a07d4f75937dead2a16de1d9ab0c0136d5b',
        metadata: {
          name: 'SubWallet',
          description: 'React Wallet for WalletConnect',
          url: 'https://www.subwallet.app/',
          icons: [
            'https://raw.githubusercontent.com/Koniverse/SubWallet-Extension/master/packages/extension-koni/public/images/icon-128.png',
          ],
        },
      },
    };

    // Mock the client
    clientMock = {
      connect: jest.fn(),
      session: {
        getAll: jest.fn(),
      } as unknown as Client['session'],
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<Client>;

    (clientMock.session.getAll as jest.Mock).mockReturnValue([]);

    // Mock the connect method of the client
    clientMock.connect.mockResolvedValue({
      uri: 'test-uri',
      approval: jest.fn().mockResolvedValue(sessionMock),
    });

    // Mock SignClient.init to return the mocked client
    jest.spyOn(SignClient, 'init').mockResolvedValue(clientMock);

    walletConnect = new WalletConnect(config, 'TestApp');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with given config and appName', () => {
      expect(walletConnect.appName).toBe('TestApp');
      expect(walletConnect.config).toBe(config);
      expect(walletConnect.metadata).toEqual({
        id: 'walletconnect',
        title: 'Polymesh Signing Manager Demo',
        description: 'Signing Manager Demo',
        urls: { main: 'https://polymesh.network' },
        iconUrl:
          'https://assets-global.website-files.com/61c0a31b90958801836efe1b/62d08014db27c031ec24b6f6_polymesh-symbol.svg',
        version: WC_VERSION,
      });
    });

    it('should set default chainIds if an empty array is provided', () => {
      const configWithoutChainIds = { ...config, chainIds: [] };
      walletConnect = new WalletConnect(configWithoutChainIds, 'TestApp');
      expect(walletConnect.config.chainIds).toEqual([POLYMESH_CHAIN_ID]);
    });

    it('should set default chainIds if not provided', () => {
      const configWithoutChainIds = { ...config, chainIds: undefined };
      walletConnect = new WalletConnect(configWithoutChainIds, 'TestApp');
      expect(walletConnect.config.chainIds).toEqual([POLYMESH_CHAIN_ID]);
    });
  });

  describe('connect', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should initialize client and handle connect URI', async () => {
      await walletConnect.connect();

      expect(clientMock.connect).toHaveBeenCalled();
      expect(walletConnect.client).toBe(clientMock);
      expect(config.handleConnectUri).toHaveBeenCalledWith('test-uri');
    });

    it('should set session and signer if session approval is granted', async () => {
      await walletConnect.connect();

      expect(walletConnect.session).toBe(sessionMock);
      expect(walletConnect.signer).toBeInstanceOf(WalletConnectSigner);
    });

    it('should throw an error if approval is rejected', async () => {
      clientMock.connect.mockResolvedValueOnce({
        uri: 'test-uri',
        approval: jest.fn().mockRejectedValue(new Error('User rejected.')),
      });

      await expect(walletConnect.connect()).rejects.toThrow('User rejected.');
    });

    it('should handle existing sessions and set session and signer if valid', async () => {
      const validSession = { ...sessionMock, expiry: Math.floor(Date.now() / 1000) + 1000 };
      (clientMock.session.getAll as jest.Mock).mockReturnValue([validSession]);

      await walletConnect.connect();

      expect(walletConnect.session).toBe(validSession);
      expect(walletConnect.signer).toBeInstanceOf(WalletConnectSigner);
      expect(clientMock.connect).not.toHaveBeenCalled();
    });

    it('should handle optionalNamespaces if optionalChainIds are provided', async () => {
      config.optionalChainIds = ['polkadot:optional-chain-id'];
      walletConnect = new WalletConnect(config, 'TestApp');

      await walletConnect.connect();

      expect(clientMock.connect).toHaveBeenCalledWith({
        requiredNamespaces: {
          polkadot: {
            chains: [POLYMESH_CHAIN_ID],
            methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
        optionalNamespaces: {
          polkadot: {
            chains: ['polkadot:optional-chain-id'],
            methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });
    });

    it('should merge modal options and open/close modal if handleConnectUri is not provided', async () => {
      config.handleConnectUri = undefined;
      walletConnect = new WalletConnect(config, 'TestApp');

      const walletConnectModalMock = {
        openModal: jest.fn(),
        closeModal: jest.fn(),
      };

      jest.spyOn(SignClient, 'init').mockResolvedValue(clientMock);
      jest.spyOn(SignClient, 'init').mockResolvedValue(clientMock);
      jest.mock('@walletconnect/modal', () => ({
        WalletConnectModal: jest.fn().mockImplementation(() => walletConnectModalMock),
      }));

      await walletConnect.connect();

      expect(walletConnectModalMock.openModal).toHaveBeenCalledWith({ uri: 'test-uri' });
      expect(walletConnect.session).toBe(sessionMock);
      expect(walletConnect.signer).toBeInstanceOf(WalletConnectSigner);
      expect(walletConnectModalMock.closeModal).toHaveBeenCalled();
    });

    it('should call onSessionDelete callback on session_delete event', async () => {
      await walletConnect.connect();
      const sessionDeleteListener = clientMock.on.mock.calls.find(
        ([event]) => event === 'session_delete'
      )?.[1];

      if (sessionDeleteListener) {
        sessionDeleteListener({
          id: 123456,
          topic: '0fad0dec80bf1226eb1646defde76536a86f0a06e604bd28f98c08c564b0e035',
        });
      }

      expect(walletConnect.session).toBeUndefined();
      expect(walletConnect.signer).toBeUndefined();
      expect(config.onSessionDelete).toHaveBeenCalled();
    });

    it('should call onSessionDelete callback on session_expire event', async () => {
      await walletConnect.connect();
      const sessionExpireListener = clientMock.on.mock.calls.find(
        ([event]) => event === 'session_expire'
      )?.[1];

      if (sessionExpireListener) {
        sessionExpireListener({
          topic: '0fad0dec80bf1226eb1646defde76536a86f0a06e604bd28f98c08c564b0e035',
        });
      }

      expect(walletConnect.session).toBeUndefined();
      expect(walletConnect.signer).toBeUndefined();
      expect(config.onSessionDelete).toHaveBeenCalled();
    });

    it('should call onSessionDelete callback on session_extend event', async () => {
      await walletConnect.connect();
      const sessionUpdateListener = clientMock.on.mock.calls.find(
        ([event]) => event === 'session_extend'
      )?.[1];
      const sessionData = { ...sessionMock, expiry: Math.floor(Date.now() / 1000) + 1000 };
      (clientMock.session.getAll as jest.Mock).mockReturnValueOnce([sessionData]);

      if (sessionUpdateListener) {
        sessionUpdateListener(sessionData);
      }

      expect(walletConnect.session).toEqual(sessionData);
      expect(walletConnect.signer?.session).toEqual(sessionData);
    });

    it('should not update session and signer if no session data is available', async () => {
      await walletConnect.connect();
      const sessionUpdateListener = clientMock.on.mock.calls.find(
        ([event]) => event === 'session_extend'
      )?.[1];
      (clientMock.session.getAll as jest.Mock).mockReturnValueOnce([]);

      if (sessionUpdateListener) {
        sessionUpdateListener(sessionMock);
      }

      expect(walletConnect.session).toBeUndefined();
      expect(walletConnect.signer).toBeUndefined();
    });
  });

  describe('getAccounts', () => {
    it('should return accounts from session', async () => {
      walletConnect.session = sessionMock;

      const accounts = await walletConnect.getAccounts();

      expect(accounts).toEqual([{ address: '5Ci1xTypyBSv1kN5kS5zzFbm1fcfyY6RCqNsDieeYhFjTtVj' }]);
    });

    it('should return empty array if no session', async () => {
      const accounts = await walletConnect.getAccounts();

      expect(accounts).toEqual([]);
    });
  });

  describe('subscribeAccounts', () => {
    it('should call callback with accounts and handle session events', async () => {
      await walletConnect.connect();

      const cb = jest.fn();

      const unsub = walletConnect.subscribeAccounts(cb);

      await new Promise(process.nextTick);
      // Initial callback check
      expect(cb).toHaveBeenCalledTimes(1);
      expect(cb).toHaveBeenNthCalledWith(1, [
        { address: '5Ci1xTypyBSv1kN5kS5zzFbm1fcfyY6RCqNsDieeYhFjTtVj' },
      ]);

      // Simulate session_delete event
      clientMock.on.mock.calls
        .filter(([event]) => event === 'session_delete')
        .forEach(([, listener]) =>
          listener?.({
            id: 123456,
            topic: '0fad0dec80bf1226eb1646defde76536a86f0a06e604bd28f98c08c564b0e035',
          })
        );

      await new Promise(process.nextTick);
      // Verify session deletion
      expect(walletConnect.session).toBe(undefined);
      expect(cb).toHaveBeenCalledTimes(2);
      expect(cb).toHaveBeenNthCalledWith(2, []);

      const validSession = { ...sessionMock, expiry: Math.floor(Date.now() / 1000) + 1000 };
      (clientMock.session.getAll as jest.Mock).mockReturnValue([validSession]);

      // Simulate session_update event
      clientMock.on.mock.calls
        .filter(([event]) => event === 'session_update')
        .forEach(([, listener]) => {
          listener?.(sessionMock);
        });

      await new Promise(process.nextTick);

      expect(cb).toHaveBeenCalledTimes(3);
      expect(cb).toHaveBeenNthCalledWith(3, [
        { address: '5Ci1xTypyBSv1kN5kS5zzFbm1fcfyY6RCqNsDieeYhFjTtVj' },
      ]);

      unsub();

      // Ensure event listeners are removed
      expect(clientMock.off).toHaveBeenCalledWith('session_delete', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_update', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_expire', expect.any(Function));
    });
  });

  describe('disconnect', () => {
    it('should disconnect client and reset wallet', async () => {
      await walletConnect.connect();
      expect(walletConnect.client).not.toBeUndefined();
      expect(walletConnect.session).not.toBeUndefined();
      expect(walletConnect.signer).not.toBeUndefined();

      await walletConnect.disconnect();

      expect(walletConnect.client).toBeUndefined();
      expect(walletConnect.session).toBeUndefined();
      expect(walletConnect.signer).toBeUndefined();
      expect(clientMock.disconnect).toBeCalled();
      // Ensure event listeners are removed
      expect(clientMock.off).toHaveBeenCalledWith('session_delete', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_update', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_expire', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_extend', expect.any(Function));
    });

    it('should reset the wallet even if there is no active session', async () => {
      await walletConnect.connect();
      walletConnect.session = undefined;
      await walletConnect.disconnect();

      expect(walletConnect.client).toBeUndefined();
      expect(walletConnect.session).toBeUndefined();
      expect(walletConnect.signer).toBeUndefined();
      expect(clientMock.disconnect).not.toBeCalled();

      // Ensure event listeners are removed
      expect(clientMock.off).toHaveBeenCalledWith('session_delete', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_update', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_expire', expect.any(Function));
      expect(clientMock.off).toHaveBeenCalledWith('session_extend', expect.any(Function));
    });
  });

  describe('isConnected', () => {
    it('should return true if client, signer, and session are defined', () => {
      walletConnect.client = clientMock;
      walletConnect.session = sessionMock;
      walletConnect.signer = new WalletConnectSigner(clientMock, sessionMock);

      expect(walletConnect.isConnected()).toBe(true);
    });

    it('should return false if any of client, signer, or session are undefined', () => {
      expect(walletConnect.isConnected()).toBe(false);
    });
  });
});
