import type { InjectedAccount, InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

export function changeAddressFormat(address: string, ss58Format: number): string {
  return encodeAddress(decodeAddress(address), ss58Format);
}

/**
 * Maps Array<InjectedAccount> -> Array<InjectedAccountWithMeta>
 */
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
