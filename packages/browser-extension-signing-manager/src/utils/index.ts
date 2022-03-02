import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';

export function changeAddressFormat(address: string, ss58Format: number): string {
  return encodeAddress(decodeAddress(address), ss58Format);
}
