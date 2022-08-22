import { VaultKey } from '../lib/hashicorp-vault/types';

export interface AddressedVaultKey extends VaultKey {
  /**
   * ss58 encoded version of the publicKey
   */
  address: string;
}
