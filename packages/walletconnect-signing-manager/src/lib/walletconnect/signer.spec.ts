import type { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import SignClient from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

import { WalletConnectSigner } from './signer';

// Mock the module before importing the class
jest.mock('@walletconnect/sign-client', () => {
  const mockRequest = jest.fn();
  return jest.fn().mockImplementation(() => ({
    request: mockRequest,
  }));
});

describe('WalletConnectSigner', () => {
  let mockClient: jest.Mocked<SignClient>;
  let mockSession: jest.Mocked<SessionTypes.Struct>;
  let walletConnectSigner: WalletConnectSigner;

  beforeEach(() => {
    mockClient = new SignClient() as jest.Mocked<SignClient>;
    mockSession = {
      topic: '59da30fdf6fe82db677a85155d10bbd9f6f5eec94d8e472568e14fd89a33c615',
      relay: {
        protocol: 'irn',
      },
      expiry: 1716579042,
      namespaces: {
        polkadot: {
          accounts: [
            'polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16:5Ci1xTypyBSv1kN5kS5zzFbm1fcfyY6RCqNsDieeYhFjTtVj',
          ],
          methods: [
            'polkadot_signTransaction',
            'polkadot_signMessage',
            'personal_sign',
            'eth_sign',
            'eth_sendTransaction',
          ],
          events: ['chainChanged', 'accountsChanged'],
          chains: ['polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16'],
        },
      },
      acknowledged: true,
      pairingTopic: 'b9eab57c59c35c906a64c71b4a227c33cdf98cc2957e37331552d273ddc867d9',
      requiredNamespaces: {
        polkadot: {
          chains: ['polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16'],
          methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
          events: ['chainChanged', 'accountsChanged'],
        },
      },
      optionalNamespaces: {},
      controller: 'ba91496933f592bf37d4eb796c084354b90d1bae7eea066d4be59da83f4d9600',
      self: {
        publicKey: '64f6d283a62bfad0231ca7fc6dded2d6c491850292bff2fbd47080cd50cc5f3b',
        metadata: {
          name: 'Polymesh Signing Manager Test',
          description: 'Signing Manager Test',
          url: 'https://example.com',
          icons: [],
        },
      },
      peer: {
        publicKey: 'ba91496933f592bf37d4eb796c084354b90d1bae7eea066d4be59da83f4d9600',
        metadata: {
          name: 'SubWallet',
          description: 'React Wallet for WalletConnect',
          url: 'https://www.subwallet.app/',
          icons: [
            'https://raw.githubusercontent.com/Koniverse/SubWallet-Extension/master/packages/extension-koni/public/images/icon-128.png',
          ],
        },
      },
    } as jest.Mocked<SessionTypes.Struct>;

    walletConnectSigner = new WalletConnectSigner(mockClient, mockSession);
  });

  test('should initialize with provided client and session', () => {
    expect(walletConnectSigner.client).toBe(mockClient);
    expect(walletConnectSigner.session).toBe(mockSession);
  });

  test('setChainIdFromGenesisHash sets the chainId correctly', () => {
    const genesisHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    walletConnectSigner.setChainIdFromGenesisHash(genesisHash);
    expect(walletConnectSigner.chainId).toBe('polkadot:1234567890abcdef1234567890abcdef');
  });

  describe('signPayload', () => {
    const payload: SignerPayloadJSON = {
      address: 'test-address',
      blockHash: '0xtest-blockHash',
      blockNumber: '0x1',
      era: '0xtest-era',
      genesisHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      method: 'test-method',
      nonce: '0x1',
      specVersion: '0x1',
      tip: '0x0',
      transactionVersion: '0x1',
      signedExtensions: [],
      version: 4,
    };

    const signature = 'test-signature';

    beforeEach(() => {
      mockClient.request.mockResolvedValue({ signature });
    });

    test('creates and sends a signing request', async () => {
      const result = await walletConnectSigner.signPayload(payload);

      expect(mockClient.request).toHaveBeenCalledWith({
        topic: mockSession.topic,
        chainId: 'polkadot:1234567890abcdef1234567890abcdef',
        request: {
          id: 1,
          jsonrpc: '2.0',
          method: 'polkadot_signTransaction',
          params: { address: payload.address, transactionPayload: payload },
        },
      });

      expect(result).toEqual({ id: 1, signature });
    });

    test('returns incremental ID for each signed payload', async () => {
      let result = await walletConnectSigner.signPayload(payload);
      expect(result.id).toBe(1);

      result = await walletConnectSigner.signPayload(payload);
      expect(result.id).toBe(2);
    });
  });

  describe('signRaw', () => {
    const raw: SignerPayloadRaw = {
      address: 'test-address',
      data: '0x1234',
      type: 'bytes',
    };

    const signature = 'test-signature';

    beforeEach(() => {
      mockClient.request.mockResolvedValue({ signature });
    });

    test('throws error if chainId is not set', async () => {
      await expect(walletConnectSigner.signRaw(raw)).rejects.toThrow(
        'chainId not found. Use setGenesisHash to configure the chainId'
      );
    });

    test('creates and sends a raw message signing request', async () => {
      const genesisHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      walletConnectSigner.setChainIdFromGenesisHash(genesisHash);

      const result = await walletConnectSigner.signRaw(raw);

      expect(mockClient.request).toHaveBeenCalledWith({
        topic: mockSession.topic,
        chainId: 'polkadot:1234567890abcdef1234567890abcdef',
        request: {
          id: 1,
          jsonrpc: '2.0',
          method: 'polkadot_signMessage',
          params: { address: raw.address, message: raw.data },
        },
      });

      expect(result).toEqual({ id: 1, signature });
    });

    test('returns incremental ID for each signed raw message', async () => {
      const genesisHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      walletConnectSigner.setChainIdFromGenesisHash(genesisHash);

      let result = await walletConnectSigner.signRaw(raw);
      expect(result.id).toBe(1);

      result = await walletConnectSigner.signRaw(raw);
      expect(result.id).toBe(2);
    });

    test('throws an error if the raw message address is not present in the session', async () => {
      const invalidRaw = { ...raw, address: 'invalid-address' };
      walletConnectSigner.setChainIdFromGenesisHash(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      );
      mockClient.request.mockRejectedValue(new Error('Invalid address'));

      await expect(walletConnectSigner.signRaw(invalidRaw)).rejects.toThrow('Invalid address');
    });
  });
});
