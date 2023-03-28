import { InjectedAccount, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { PolkadotSigner, SigningManager } from '@polymeshassociation/signing-manager-types';

import { Extension, NetworkInfo, UnsubCallback } from '../types';
import { changeAddressFormat, enableWeb3Extension, getExtensions, mapAccounts } from '../utils';

export class BrowserExtensionSigningManager implements SigningManager {
  private _ss58Format?: number;
  private _genesisHash?: string;
  private _accountType?: string;

  /**
   * Create a Signing Manager that connects to a browser extension
   *
   * @param args.appName - name of the dApp attempting to connect to the extension
   * @param args.extensionName - name of the extension to be used (optional, defaults to 'polywallet')
   * @param args.ss58Format - SS58 format for the extension in which the returned addresses will be encoded(optional)
   * @param args.genesisHash - genesis hash to be used in filtering the accounts returned by the extension
   * @param args.accountType - account type to be used in filtering the accounts returned by the extension
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
    ss58Format?: number;
    genesisHash?: string;
    accountType?: string;
  }): Promise<BrowserExtensionSigningManager> {
    const { appName, extensionName = 'polywallet', ss58Format } = args;
    const extension = await enableWeb3Extension(appName, extensionName);

    const signingManager = new BrowserExtensionSigningManager(extension as Extension);

    if (ss58Format) {
      signingManager.setSs58Format(ss58Format);
    }

    return signingManager;
  }

  private constructor(private readonly extension: Extension) {}

  /**
   * Set the SS58 format in which returned addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
  }

  /**
   * Set the genesis hash which will be used in filtering the accounts returned by the extension
   */
  public setGenesisHash(genesisHash: string): void {
    this._genesisHash = genesisHash;
  }

  /**
   * Set the account type which will be used in filtering the accounts returned by the extension
   */
  public setAccountType(accountType: string): void {
    this._accountType = accountType;
  }

  /**
   * Returns the list of account available for the extension. Filters the list of accounts based on genesis hash and account type
   */
  private getWeb3Accounts(accounts: InjectedAccount[]): InjectedAccount[] {
    return accounts.filter(
      account =>
        (!account.type || !this._accountType || this._accountType.includes(account.type)) &&
        (!account.genesisHash || !this._genesisHash || account.genesisHash === this._genesisHash)
    );
  }

  /**
   * Return the addresses of all Accounts in the Browser Wallet Extension
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccounts(): Promise<string[]> {
    const ss58Format = this.getSs58Format('getAccounts');

    const accounts = await this.extension.accounts.get();
    const filteredAccounts = this.getWeb3Accounts(accounts);

    // we make sure the addresses are returned in the correct SS58 format
    return filteredAccounts.map(({ address }) => changeAddressFormat(address, ss58Format));
  }

  /**
   * Return the addresses of all Accounts along with other metadata in the Browser Wallet Extension
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccountsWithMeta(): Promise<InjectedAccountWithMeta[]> {
    const ss58Format = this.getSs58Format('getAccounts');

    const accounts = await this.extension.accounts.get();
    const filteredAccounts = this.getWeb3Accounts(accounts);

    return mapAccounts(this.extension.name, filteredAccounts, ss58Format);
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
   * @param callbackWithMeta pass this value as true if the callback parameter expects `InjectedAccountWithMeta[]` as param
   * @throws if the callback is triggered before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public onAccountChange(
    cb: (accounts: string[] | InjectedAccountWithMeta[]) => void,
    callbackWithMeta = false
  ): UnsubCallback {
    let ss58Format: number;

    return this.extension.accounts.subscribe(accounts => {
      if (!ss58Format) {
        ss58Format = this.getSs58Format('onAccountChange callback');
      }

      const filteredAccounts = this.getWeb3Accounts(accounts);

      let callbackAccounts;
      if (callbackWithMeta) {
        callbackAccounts = mapAccounts(this.extension.name, filteredAccounts, ss58Format);
      } else {
        callbackAccounts = filteredAccounts.map(({ address }) =>
          changeAddressFormat(address, ss58Format)
        );
      }

      cb(callbackAccounts);
    });
  }

  /**
   * Subscribes via callback to a change in the extension's selected network (i.e. going from Testnet to Mainnet)
   *
   * The callback will be called with the new network information
   *
   * @note No callback is called for network agnostic extensions
   */
  public onNetworkChange(cb: (networkInfo: NetworkInfo) => void): UnsubCallback {
    if (this.extension.network) {
      this.extension.network.subscribe(cb);
    }
    return () => undefined;
  }

  /**
   * @hidden
   *
   * @throws if the SS58 format hasn't been set yet
   */
  private getSs58Format(methodName: string): number {
    const { _ss58Format: format } = this;

    if (format === undefined) {
      throw new Error(
        `Cannot call '${methodName}' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?`
      );
    }

    return format;
  }

  /**
   * Returns the list of all available extensions
   */
  public static getExtensionList(): string[] {
    const extensions = getExtensions();
    return Object.keys(extensions);
  }

  /**
   * Returns the details of current network to which the extension is connected. Returns `null` for network agnostic extensions
   */
  public async getCurrentNetwork(): Promise<NetworkInfo | null> {
    if (this.extension.network) {
      return this.extension.network.get();
    }

    console.log(`The '${this.extension.name}' extension is network agnostic`);

    return null;
  }
}
