import { web3Enable } from '@polkadot/extension-dapp';
import { PolkadotSigner, SigningManager } from '@polymathnetwork/signing-manager-types';

import { Extension, NetworkInfo, UnsubCallback } from '../types';
import { changeAddressFormat } from '../utils';

export class BrowserExtensionSigningManager implements SigningManager {
  private _ss58Format?: number;

  /**
   * Create a Signing Manager that connects to a browser extension
   *
   * @param args.appName - name of the dApp attempting to connect to the extension
   * @param args.extensionName - name of the extension to be used (optional, defaults to 'polywallet')
   *
   * @note if this is the first time the user is interacting with the dApp using that specific extension,
   *   they will be prompted by the extension to add the dApp to the allowed list
   *
   * @throws
   *   - if there is no extension with the passed name
   *   - if there is more than one extension with the passed name (one should be disabled)
   *   - if the extension has blocked permissions for the dApp
   */
  public static async create(args: {
    appName: string;
    extensionName?: string;
  }): Promise<BrowserExtensionSigningManager> {
    const { appName, extensionName = 'polywallet' } = args;
    const extensions = await web3Enable(appName);

    const filteredExtensions = extensions.filter(({ name }) => name === extensionName);

    if (filteredExtensions.length === 0) {
      throw new Error(
        `There is no extension named "${extensionName}", or the extension has blocked the "${appName}" dApp`
      );
    }

    if (filteredExtensions.length > 1) {
      throw new Error(`There is more than one extension named "${extensionName}"`);
    }

    return new BrowserExtensionSigningManager(filteredExtensions[0] as Extension);
  }

  private constructor(private readonly extension: Extension) {}

  /**
   * Set the SS58 format in which returned addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
  }

  /**
   * Return the addresses of all Accounts in the Browser Wallet Extension
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccounts(): Promise<string[]> {
    const ss58Format = this.getSs58Format('getAccounts');

    const accounts = await this.extension.accounts.get();

    // we make sure the addresses are returned in the correct SS58 format
    return accounts.map(({ address }) => changeAddressFormat(address, ss58Format));
  }

  /**
   * Return a signer object that uses the extension Accounts to sign
   */
  public getExternalSigner(): PolkadotSigner {
    return this.extension.signer;
  }

  /**
   * Subscribes via callback to any change in the extension's Accounts. This can be either
   *   from an Account being added/removed, or from the user changing the selected Account
   *
   * The callback will be called with the new array of Accounts
   *
   * Convention is for the current selected Account to be the first value in the array, but it
   *   depends on the extension implementation
   *
   * @throws if the callback is triggered before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public onAccountChange(cb: (accounts: string[]) => void): UnsubCallback {
    let ss58Format: number;

    return this.extension.accounts.subscribe(accounts => {
      if (!ss58Format) {
        ss58Format = this.getSs58Format('onAccountChange callback');
      }

      cb(accounts.map(({ address }) => changeAddressFormat(address, ss58Format)));
    });
  }

  /**
   * Subscribes via callback to a change in the extension's selected network (i.e. going from Testnet to Mainnet)
   *
   * The callback will be called with the new network information
   */
  public onNetworkChange(cb: (networkInfo: NetworkInfo) => void): UnsubCallback {
    return this.extension.network.subscribe(cb);
  }

  /**
   * @hidden
   *
   * @throws if the SS58 format hasn't been set yet
   */
  private getSs58Format(methodName: string): number {
    const { _ss58Format } = this;

    if (_ss58Format === undefined) {
      throw new Error(
        `Cannot call '${methodName}' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?`
      );
    }

    return _ss58Format;
  }
}
