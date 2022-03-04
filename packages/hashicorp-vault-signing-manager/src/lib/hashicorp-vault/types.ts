/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Response for LIST /keys
 */
export interface ListKeysResponse {
  data: {
    keys: string[];
  };
  lease_duration: number;
  lease_id: string;
  renewable: false;
}

/**
 * Response for GET /keys/:name
 */
export interface GetKeyResponse {
  data: {
    type: 'aes256-gcm96' | 'chacha20-poly1305' | 'd25519' | 'ecdsa-p256' | 'rsa-2048' | 'rsa-4096';
    deletion_allowed: boolean;
    derived: boolean;
    exportable: boolean;
    allow_plaintext_backup: boolean;
    keys: {
      /**
       * Indexed by key version
       */
      [key: string]: {
        creation_time: string;
        name: string;
        public_key: string; // base64
      };
    };
    min_decryption_version: number;
    min_encryption_version: number;
    name: string;
    supports_encryption: boolean;
    supports_decryption: boolean;
    supports_derivation: boolean;
    supports_signing: boolean;
    latest_version?: number;
  };
}

/**
 * Response for POST /sign/:name
 */
export interface SignResponse {
  data: {
    signature: string;
  };
}

/**
 * Signable data as expected by the Vault API
 */
export interface SignRequestPayload {
  /**
   * base64 encoded data to sign
   */
  input: string;
  /**
   * version of the key to use for signing
   */
  key_version: number;
}
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Outward facing data for a key
 */
export interface VaultKey {
  /**
   * Internal Vault name. This is used to identify the key within the vault
   */
  name: string;
  /**
   * Polymesh public key in hex format (**NOT** SS58 encoded)
   */
  publicKey: string;
  /**
   * Version of the key in the Vault (used to distinguish between public keys of the same name)
   */
  version: number;
}
