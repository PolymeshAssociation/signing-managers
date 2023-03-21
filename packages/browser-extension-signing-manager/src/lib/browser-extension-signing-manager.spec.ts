import { InjectedAccount } from '@polkadot/extension-inject/types';
import { PolkadotSigner } from '@polymeshassociation/signing-manager-types';

import { Extension } from '../types';
import * as utilsModule from '../utils';
import { BrowserExtensionSigningManager } from './browser-extension-signing-manager';

jest.mock('@polkadot/extension-dapp', () => ({
  web3Enable: jest.fn(),
}));

describe('BrowserExtensionSigningManager Class', () => {
  let signingManager: BrowserExtensionSigningManager;
  let args: { appName: string; extensionName?: string };
  let enableStub: jest.SpyInstance;
  const accountsGetStub = jest.fn();
  const accountsSubscribeStub = jest.fn();
  const networkSubscribeStub = jest.fn();

  const accounts: InjectedAccount[] = [
    {
      name: 'ACCOUNT 1',
      address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
      genesisHash: 'someHash',
      type: 'ed25519',
    },
    {
      name: 'ACCOUNT 2',
      address: '5HQLVKFYkytr9HisQRWoUArUWw8YNWUmhLdXztRFjqysiNUx',
      genesisHash: 'someHash',
      type: 'ed25519',
    },
  ];

  beforeAll(() => {
    enableStub = jest.spyOn(utilsModule, 'enableWeb3Extension');
    args = {
      appName: 'testDApp',
      extensionName: 'polywallet',
    };
  });

  beforeEach(async () => {
    enableStub.mockResolvedValue({
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
    } as Extension);
  });

  describe('method: create', () => {
    it('should create instance of BrowserExtensionSigningManager', async () => {
      expect(enableStub).toHaveBeenCalledTimes(1);
      expect(enableStub).toHaveBeenCalledWith(args.appName, args.extensionName);
      enableStub.mockClear();

      await BrowserExtensionSigningManager.create({ appName: 'someOtherApp' });
      expect(enableStub).toHaveBeenCalledTimes(1);
      expect(enableStub).toHaveBeenCalledWith('someOtherApp', 'polywallet');
    });
  });

  describe('method: getAccounts', () => {
    it('should return all Accounts held in the extension, respecting the SS58 format', async () => {
      accountsGetStub.mockResolvedValue(accounts);

      let result = await signingManager.getAccounts();

      expect(result).toEqual(accounts.map(({ address }) => address));

      signingManager.setSs58Format(0);

      result = await signingManager.getAccounts();

      expect(result).toEqual(
        accounts.map(({ address }) => utilsModule.changeAddressFormat(address, 0))
      );
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      signingManager = await BrowserExtensionSigningManager.create(args);

      expect(signingManager.getAccounts()).rejects.toThrow(
        "Cannot call 'getAccounts' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: getAccountsWithMeta', () => {
    it('should return all Accounts along with its metadata held in the extension, respecting the SS58 format', async () => {
      accountsGetStub.mockResolvedValue(accounts);

      let result = await signingManager.getAccountsWithMeta();

      expect(result).toEqual(
        accounts.map(({ address, genesisHash, name, type }) => ({
          address,
          meta: { genesisHash, name, source: 'polywallet' },
          type,
        }))
      );

      signingManager.setSs58Format(0);

      result = await signingManager.getAccountsWithMeta();

      expect(result).toEqual(
        accounts.map(({ address, genesisHash, name, type }) => ({
          address: utilsModule.changeAddressFormat(address, 0),
          meta: { genesisHash, name, source: 'polywallet' },
          type,
        }))
      );
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
      accountsSubscribeStub.mockImplementation(cb => {
        cb(accounts);
      });

      const callback = jest.fn();
      signingManager.onAccountChange(callback, false);

      expect(callback).toHaveBeenCalledWith(accounts.map(({ address }) => address));

      signingManager.setSs58Format(0);

      callback.mockReset();
      signingManager.onAccountChange(callback);

      expect(callback).toHaveBeenCalledWith(
        accounts.map(({ address }) => utilsModule.changeAddressFormat(address, 0))
      );

      callback.mockReset();
      signingManager.onAccountChange(callback, true);
      signingManager.setSs58Format(42);

      expect(callback).toHaveBeenCalledWith(utilsModule.mapAccounts('polywallet', accounts, 42));
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

  describe('method: getExtensionList', () => {
    it('should return the list of all available extensions', () => {
      jest.spyOn(utilsModule, 'getExtensions').mockReturnValue({
        polywallet: {
          version: '5.4.1',
        },
        talisman: {
          version: '1.1.0',
        },
      });
      expect(BrowserExtensionSigningManager.getExtensionList()).toEqual(['polywallet', 'talisman']);
    });
  });
});
