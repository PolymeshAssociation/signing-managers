import { VaultKey } from '../lib/hashicorp-vault/types';

export interface AddressedVaultKey extends VaultKey {
  /**
   * ss58 encoded version of the publicKey
   */
  address: string;
}

export class SignerTimeoutError extends Error {
  public data?: Record<string, unknown>;

  /**
   * @hidden
   */
  constructor({ message, data }: { message?: string; data?: Record<string, unknown> }) {
    super(message);

    this.data = data;
  }
}
