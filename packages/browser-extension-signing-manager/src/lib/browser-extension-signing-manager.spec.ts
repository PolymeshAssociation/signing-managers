import { web3Enable } from '@polkadot/extension-dapp';
import { PolkadotSigner } from '@polymathnetwork/signing-manager-types';

import { Extension } from '../types';
import { changeAddressFormat } from '../utils';
import { BrowserExtensionSigningManager } from './browser-extension-signing-manager';

jest.mock('@polkadot/extension-dapp', () => ({
  web3Enable: jest.fn(),
}));

describe('BrowserExtensionSigningManager Class', () => {
  let signingManager: BrowserExtensionSigningManager;
  let args: { appName: string; extensionName?: string };
  const enableStub = web3Enable as jest.MockedFunction<typeof web3Enable>;
  const accountsGetStub = jest.fn();
  const accountsSubscribeStub = jest.fn();
  const networkSubscribeStub = jest.fn();

  beforeAll(() => {
    args = {
      appName: 'testDApp',
      extensionName: 'polywallet',
    };
  });

  beforeEach(async () => {
    enableStub.mockResolvedValue([
      {
        name: 'polywallet',
        accounts: {
          get: accountsGetStub,
          subscribe: accountsSubscribeStub,
        },
        network: {
          subscribe: networkSubscribeStub,
          get: jest.fn(),
        },
        version: '1.5.5',
        signer: 'signer' as unknown as PolkadotSigner,
      },
    ] as Extension[]);
    signingManager = await BrowserExtensionSigningManager.create(args);

    signingManager.setSs58Format(42);
  });

  describe('method: create', () => {
    it('should throw an error if there is no extension with the passed name', () => {
      enableStub.mockResolvedValue([
        {
          name: 'other-wallet',
        },
      ] as Extension[]);

      expect(BrowserExtensionSigningManager.create(args)).rejects.toThrow(
        'There is no extension named "polywallet", or the extension has blocked the "testDApp" dApp'
      );
    });

    it('should throw an error if there is more than one extension with the passed name', () => {
      enableStub.mockResolvedValue([
        {
          name: 'polywallet',
        },
        {
          name: 'polywallet',
        },
      ] as Extension[]);

      expect(
        BrowserExtensionSigningManager.create({ ...args, extensionName: undefined })
      ).rejects.toThrow('There is more than one extension named "polywallet"');
    });
  });

  describe('method: getAccounts', () => {
    it('should return all Accounts held in the extension, respecting the SS58 format', async () => {
      const accounts = [
        {
          address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        },
        {
          address: '5HQLVKFYkytr9HisQRWoUArUWw8YNWUmhLdXztRFjqysiNUx',
        },
      ];
      accountsGetStub.mockResolvedValue(accounts);

      let result = await signingManager.getAccounts();

      expect(result).toEqual(accounts.map(({ address }) => address));

      signingManager.setSs58Format(0);

      result = await signingManager.getAccounts();

      expect(result).toEqual(accounts.map(({ address }) => changeAddressFormat(address, 0)));
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      signingManager = await BrowserExtensionSigningManager.create(args);

      expect(signingManager.getAccounts()).rejects.toThrow(
        "Cannot call 'getAccounts' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: getExternalSigner', () => {
    it('should return the signer injected by the extension', () => {
      const signer = signingManager.getExternalSigner();

      // this is the value returned by the web3Enable stub, set in `beforeEach`
      expect(signer).toBe('signer');
    });
  });

  describe('method: onAccountChange', () => {
    it('should pass the new Accounts to the callback, respecting the SS58 format', () => {
      const newAccounts = [
        {
          address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        },
        {
          address: '5HQLVKFYkytr9HisQRWoUArUWw8YNWUmhLdXztRFjqysiNUx',
        },
      ];
      accountsSubscribeStub.mockImplementation(cb => {
        cb(newAccounts);
      });

      const callback = jest.fn();
      signingManager.onAccountChange(callback);

      expect(callback).toHaveBeenCalledWith(newAccounts.map(({ address }) => address));

      signingManager.setSs58Format(0);

      callback.mockReset();
      signingManager.onAccountChange(callback);

      expect(callback).toHaveBeenCalledWith(
        newAccounts.map(({ address }) => changeAddressFormat(address, 0))
      );
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      signingManager = await BrowserExtensionSigningManager.create(args);

      accountsSubscribeStub.mockImplementation(cb => {
        cb([]);
      });

      expect(() => signingManager.onAccountChange(() => 1)).toThrow(
        "Cannot call 'onAccountChange callback' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: onNetworkChange', () => {
    it('should pass the new network to the callback', () => {
      const newNetwork = {
        name: 'testnet',
        label: 'Testnet',
        wssUrl: 'wss://testnet.url',
      };

      networkSubscribeStub.mockImplementation(cb => {
        cb(newNetwork);
      });

      const callback = jest.fn();
      signingManager.onNetworkChange(callback);

      expect(callback).toHaveBeenCalledWith(newNetwork);
    });
  });
});
