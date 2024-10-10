import { KeyProperties, KeyVaultKey } from '@azure/keyvault-keys';

export interface AzureKey {
  /**
   * Internal key ID.
   */
  id: string;
  /**
   * Internal Azure name. This is used to identify the key within the Key Vault
   */
  name: string;

  /**
   * The public key in raw format
   */
  publicKey: Buffer;

  /**
   * Additional details about the key
   */
  properties: KeyProperties;

  /**
   * The Azure key SDK object. Used for interacting with the key
   */
  keyVaultKey: KeyVaultKey;
}

/**
 * Signable data as expected by the Azure Key Vault API
 */
export interface SignRequestPayload {
  /**
   * base64 encoded data to sign
   */
  input: string;
}

export class AzureSignerError extends Error {
  public data?: Record<string, unknown>;

  /**
   * @hidden
   */
  constructor({ message, data }: { message?: string; data?: Record<string, unknown> }) {
    super(message);

    this.data = data;
  }
}
