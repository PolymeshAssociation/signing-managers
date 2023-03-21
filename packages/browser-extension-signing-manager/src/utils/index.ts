import { documentReadyPromise } from '@polkadot/extension-dapp/util';
import {
  InjectedAccount,
  InjectedAccountWithMeta,
  InjectedExtension,
  InjectedWindow,
  InjectedWindowProvider,
  Unsubcall,
} from '@polkadot/extension-inject/types';
import { objectSpread } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

export function changeAddressFormat(address: string, ss58Format: number): string {
  return encodeAddress(decodeAddress(address), ss58Format);
}

export function getExtensions(): Record<string, InjectedWindowProvider> {
  const win = window as Window & InjectedWindow;
  return win.injectedWeb3 || {};
}

/**
 * Retrieves a given extension if available on the window
 * @throws if no extensionName is provided
 */
export async function getWindowExtension(
  originName: string,
  extensionName: string
): Promise<InjectedExtension> {
  const win = window as Window & InjectedWindow;
  const extension = win.injectedWeb3[extensionName];

  if (!extension) {
    throw new Error(`Extension '${extensionName}' not found`);
  }

  const { connect, enable, version } = extension;

  if (connect) {
    // new style, returning all info
    return connect(originName);
  }

  if (enable) {
    // previous interface, leakages on name/version
    return enable(originName)
      .then(e =>
        objectSpread<InjectedExtension>({ name: extensionName, version: version || 'unknown' }, e)
      )
      .catch((error: Error) => {
        console.error(`Error initializing '${extensionName}': ${error.message}`);
        throw error;
      });
  }

  throw new Error(`Extension '${extensionName}' does not provide 'connect' or 'enable' hooks`);
}

/**
 * Enables a given providers found on the injected window interface
 */
export async function enableWeb3Extension(
  originName: string,
  extensionName = 'polywallet'
): Promise<InjectedExtension> {
  console.log('here');
  if (!originName.trim().length) {
    throw new Error('You must pass a name for your app to enable the given extension');
  }

  if (!extensionName.trim().length) {
    throw new Error(`Extension '${extensionName}' not found`);
  }

  return documentReadyPromise(() =>
    getWindowExtension(originName, extensionName).then(extension => {
      const { name, version, accounts } = extension;

      // if we don't have an accounts subscriber, add a single-shot version
      if (!accounts.subscribe) {
        accounts.subscribe = (
          cb: (accounts: InjectedAccount[]) => void | Promise<void>
        ): Unsubcall => {
          accounts.get().then(cb).catch(console.error);

          return (): void => {
            // no unsubscribe needed, this is a single-shot
          };
        };
      }

      console.log(`enableWeb3Extension: Enabled '${name}/${version}' extension`);
      return extension;
    })
  );
}

// internal helper to map from Array<InjectedAccount> -> Array<InjectedAccountWithMeta>
export function mapAccounts(
  source: string,
  list: InjectedAccount[],
  ss58Format: number
): InjectedAccountWithMeta[] {
  return list.map(
    ({ address, genesisHash, name, type }): InjectedAccountWithMeta => ({
      address: changeAddressFormat(address, ss58Format),
      meta: { genesisHash, name, source },
      type,
    })
  );
}
