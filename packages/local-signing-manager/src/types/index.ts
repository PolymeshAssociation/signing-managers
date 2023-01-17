/**
 * URI|mnemonic|hex representation of a private key
 */
export type PrivateKey =
  | {
      uri: string;
    }
  | {
      mnemonic: string;
    }
  | {
      seed: string;
    };

/**
 * Supported key types. Generally `sr25519` is preferred, but `ed25519` is more widely supported
 */
export type KeyRingType = 'sr25519' | 'ed25519';
