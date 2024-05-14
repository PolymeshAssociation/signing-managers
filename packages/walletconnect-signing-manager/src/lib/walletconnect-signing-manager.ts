import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import type { SigningManager } from '@polymeshassociation/signing-manager-types';

import type { CreateParams, UnsubCallback } from '../types';
import { changeAddressFormat, mapAccounts } from '../utils';
import { WalletConnect } from './walletconnect';
import { WalletConnectSigner } from './walletconnect/signer';

export class WalletConnectSigningManager implements SigningManager {
  private _ss58Format?: number;
  private _genesisHash?: string;

  private constructor(private readonly walletConnect: WalletConnect) {}

  /**
   * Create a Signing Manager that connects to a browser extension
   *
   * @param args.config - walletConnect configuration parameters
   * @param args.appName - name of the dApp attempting to connect to the extension
   * @param args.ss58Format - SS58 format for the extension in which the returned addresses will be encoded (optional)
   * @param args.genesisHash - genesis hash of the target chain (optional)
   *
   */
  public static async create(args: CreateParams): Promise<WalletConnectSigningManager> {
    const { appName, config, ss58Format, genesisHash } = args;

    const walletConnect = new WalletConnect(config, appName);
    await walletConnect.connect();
    const signingManager = new WalletConnectSigningManager(walletConnect);

    if (ss58Format) {
      signingManager.setSs58Format(ss58Format);
    }
    if (genesisHash) {
      signingManager.setGenesisHash(genesisHash);
    }

    return signingManager;
  }

  /**
   * Set the SS58 format in which returned addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
  }

  /**
   * Set the genesis hash.
   * Note: This is required to configure the chainId for signing raw data. When signing transaction payloads
   * the chainId will be derived from the genesisHash contained in the transaction payload.
   */
  public setGenesisHash(genesisHash: string): void {
    this._genesisHash = genesisHash;
    this.walletConnect.signer?.setChainIdFromGenesisHash(genesisHash);
  }

  /**
   * Return the addresses of all provided Accounts from the connected wallet
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccounts(): Promise<string[]> {
    const ss58Format = this.getSs58Format('getAccounts');

    const accounts = await this.walletConnect.getAccounts();

    // we make sure the addresses are returned in the correct SS58 format
    return accounts.map(({ address }) => changeAddressFormat(address, ss58Format));
  }

  /**
   * Return the addresses of all Accounts formatted as InjectedAccountWithMeta type.
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccountsWithMeta(): Promise<InjectedAccountWithMeta[]> {
    const ss58Format = this.getSs58Format('getAccountsWithMeta');

    const accounts = await this.walletConnect.getAccounts();

    return mapAccounts(
      this.walletConnect.session?.peer.metadata.name || 'walletConnect',
      accounts,
      ss58Format
    );
  }

  /**
   * Return a signer object that uses the connected Accounts to sign
   */
  public getExternalSigner(): WalletConnectSigner {
    if (!this.walletConnect.signer) throw new Error('WalletConnect signer not connected');
    return this.walletConnect.signer;
  }

  /**
   * Subscribes via callback to any change in the walletConnect Accounts. This can be either
   * from an Account being added/removed from the session or the session disconnecting
   *
   * The callback will be called with the new array of Accounts
   *
   * @param callbackWithMeta pass this value as true if the callback parameter expects `InjectedAccountWithMeta[]` as param
   * @throws if the callback is triggered before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public onAccountChange(
    cb: (accounts: string[] | InjectedAccountWithMeta[]) => void,
    callbackWithMeta = false
  ): UnsubCallback {
    let ss58Format: number;

    return this.walletConnect.subscribeAccounts(accounts => {
      if (!ss58Format) {
        ss58Format = this.getSs58Format('onAccountChange callback');
      }

      let callbackAccounts;
      if (callbackWithMeta) {
        callbackAccounts = mapAccounts(
          this.walletConnect.session?.peer.metadata.name || 'walletConnect',
          accounts,
          ss58Format
        );
      } else {
        callbackAccounts = accounts.map(({ address }) => changeAddressFormat(address, ss58Format));
      }
      cb(callbackAccounts);
    });
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
   * disconnect a connected walletConnect session
   */

  public async disconnect(): Promise<void> {
    return this.walletConnect.disconnect();
  }

  /**
   * check the wallet connect connection status
   */

  public isConnected(): boolean {
    return this.walletConnect.isConnected();
  }
}
