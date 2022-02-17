import { Signer } from '@polkadot/types/types';

/**
 * `signPayload` and `signRaw` must be implemented. Only `update` is optional
 */
export type PolkadotSigner = Required<Omit<Signer, 'update'>> & Signer;

export interface SigningManager {
  /**
   * Fetch and return all managed Accounts
   */
  getAccounts(): Promise<string[]>;

  /**
   * Return the external signer object that manages all signing logic
   */
  getExternalSigner(): PolkadotSigner;

  /**
   * Set the format in which addresses returned by the Signing Manager are encoded
   */
  setSs58Format(ss58Format: number): void;
}
