import type { InjectedAccount } from '@polkadot/extension-inject/types';
import type Client from '@walletconnect/sign-client';
import { SignClient } from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

import { WalletConnectSigner } from './signer';
import type {
  BaseWallet,
  UnsubCallback,
  WalletConnectConfiguration,
  WalletConnectModalOptions,
  WalletMetadata,
  WcAccount,
} from './types.js';

/**
 * Chain ID for Polymesh mainnet.
 */
export const POLYMESH_CHAIN_ID = 'polkadot:6fbd74e5e1d0a61d52ccfe9d4adaed16';

/**
 * Wallet Connect version.
 */
export const WC_VERSION = '2.0';

/**
 * Converts Wallet Connect account to a public key.
 * @param wcAccount - Wallet Connect account.
 * @returns public key.
 */
const wcAccountToKey = (wcAccount: WcAccount) => ({ address: wcAccount.split(':')[2] });

/**
 * Represents a Wallet Connect wallet.
 */
export class WalletConnect implements BaseWallet {
  appName: string;
  config: WalletConnectConfiguration;
  metadata: WalletMetadata;
  client: Client | undefined;
  session: SessionTypes.Struct | undefined;
  signer: WalletConnectSigner | undefined;

  private _handleSessionDeleteOrExpire: () => void;
  private _handleSessionChange: () => void;
  private unsubscribeEvents: (() => void) | undefined;
  /**
   * Creates an instance of WalletConnectWallet.
   * @param config - Configuration for Wallet Connect.
   * @param appName - Name of the application.
   */
  public constructor(config: WalletConnectConfiguration, appName: string) {
    if (!config.chainIds || config.chainIds.length === 0) config.chainIds = [POLYMESH_CHAIN_ID];
    this.config = config;
    this.appName = appName;
    this.metadata = {
      id: 'walletconnect',
      title: config.metadata?.name || 'WalletConnect',
      description: config.metadata?.description || '',
      urls: { main: config.metadata?.url || '' },
      iconUrl: config.metadata?.icons[0] || '',
      version: WC_VERSION,
    };

    // Bind event handlers and store references
    this._handleSessionDeleteOrExpire = this.handleSessionDeleteOrExpire.bind(this);
    this._handleSessionChange = this.handleSessionChange.bind(this);
  }

  /**
   * Resets the wallet.
   */
  private reset(): void {
    this.client = undefined;
    this.session = undefined;
    this.signer = undefined;
  }

  /**
   * Connects to WalletConnect.
   * @returns Promise.
   */
  public async connect(): Promise<void> {
    this.reset();

    this.client = await SignClient.init(this.config);
    const eventHandlers = [
      { event: 'session_delete', handler: this._handleSessionDeleteOrExpire },
      { event: 'session_expire', handler: this._handleSessionDeleteOrExpire },
      { event: 'session_update', handler: this._handleSessionChange },
      { event: 'session_extend', handler: this._handleSessionChange },
    ] as const;

    eventHandlers.forEach(({ event, handler }) => {
      this.client?.on(event, handler);
    });

    this.unsubscribeEvents = () => {
      eventHandlers.forEach(({ event, handler }) => {
        this.client?.off(event, handler);
      });
    };
    const sessions = this.client.session.getAll();
    const lastKeyIndex = sessions.length - 1;
    const lastSession = sessions[lastKeyIndex];

    if (lastSession && lastSession.expiry * 1000 > Date.now()) {
      this.session = lastSession;
      this.signer = new WalletConnectSigner(this.client, lastSession);
      return;
    }

    const optionalNamespaces = this.config.optionalChainIds?.length
      ? {
          polkadot: {
            chains: this.config.optionalChainIds,
            methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
            events: ['chainChanged', 'accountsChanged'],
          },
        }
      : undefined;

    const namespaces = {
      requiredNamespaces: {
        polkadot: {
          chains: this.config.chainIds,
          methods: ['polkadot_signTransaction', 'polkadot_signMessage'],
          events: ['chainChanged', 'accountsChanged'],
        },
      },
      optionalNamespaces,
    };

    const { uri, approval } = await this.client.connect(namespaces);

    if (uri) {
      if (this.config.handleConnectUri) {
        this.config.handleConnectUri(uri);

        this.session = await approval();
        this.signer = new WalletConnectSigner(this.client, this.session);
      } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { WalletConnectModal } = await import('@walletconnect/modal');
        const defaultModalOptions: WalletConnectModalOptions = {
          enableExplorer: true,
          explorerExcludedWalletIds: 'ALL',
          explorerRecommendedWalletIds: [
            '43fd1a0aeb90df53ade012cca36692a46d265f0b99b7561e645af42d752edb92', // Nova Wallet
            '9ce87712b99b3eb57396cc8621db8900ac983c712236f48fb70ad28760be3f6a', // SubWallet
          ],
        };
        const mergedModalOptions = { ...defaultModalOptions, ...this.config.modalOptions };
        const walletConnectModal = new WalletConnectModal({
          projectId: this.config.projectId,
          chains: [...(this.config.chainIds ?? []), ...(this.config.optionalChainIds ?? [])],
          ...mergedModalOptions,
        });
        walletConnectModal.openModal({ uri });
        try {
          this.session = await approval();
          this.signer = new WalletConnectSigner(this.client, this.session);
        } finally {
          walletConnectModal.closeModal();
        }
      }
    }
  }

  /**
   * Gets accounts from the current session.
   * @returns Array of accounts.
   */
  public async getAccounts(): Promise<InjectedAccount[]> {
    let accounts: InjectedAccount[] = [];

    if (this.session) {
      const wcAccounts = Object.values(this.session.namespaces)
        .map(namespace => namespace.accounts)
        .flat();

      accounts = wcAccounts.map(wcAccount => wcAccountToKey(wcAccount as WcAccount));
    }
    return accounts;
  }

  /**
   * Subscribes to account changes.
   * @param cb - Callback function.
   * @returns Unsubscribe function.
   */
  public subscribeAccounts(cb: (accounts: InjectedAccount[]) => void): UnsubCallback {
    const handler = async () => {
      cb(await this.getAccounts());
    };

    handler();

    if (this.client) {
      this.client.on('session_delete', handler);
      this.client.on('session_expire', handler);
      this.client.on('session_update', handler);
    }

    const unsubscribe = () => {
      if (this.client) {
        this.client.off('session_delete', handler);
        this.client.off('session_expire', handler);
        this.client.off('session_update', handler);
      }
    };

    return unsubscribe;
  }

  /**
   * Disconnects from Wallet Connect.
   */
  public async disconnect(): Promise<void> {
    if (this.session?.topic) {
      this.client?.disconnect({
        topic: this.session?.topic,
        reason: {
          code: -1,
          message: 'Disconnected by client!',
        },
      });
    }

    this.unsubscribeEvents?.();

    this.reset();
  }

  /**
   * Checks if connected to Wallet Connect.
   * @returns Boolean indicating connection status.
   */
  public isConnected(): boolean {
    return !!(this.client && this.signer && this.session);
  }

  /**
   * Handles session_delete event.
   */
  private handleSessionDeleteOrExpire() {
    this.session = undefined;
    this.signer = undefined;
    if (this.config.onSessionDelete) {
      this.config.onSessionDelete();
    }
  }

  /**
   * Handles session_update and session_extend events.
   */
  private handleSessionChange() {
    if (this.client) {
      const sessions = this.client.session.getAll();
      const lastKeyIndex = sessions.length - 1;
      const lastSession = sessions[lastKeyIndex];

      if (lastSession) {
        this.session = lastSession;
        this.signer = new WalletConnectSigner(this.client, lastSession);
      } else {
        this.session = undefined;
        this.signer = undefined;
      }
    }
  }
}
