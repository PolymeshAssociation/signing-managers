/**
 * URI|mnemonic|hex representation of a private key
 */
export type PrivateKey =
  | {
      uri: string;
      derivationPath?: string;
    }
  | {
      mnemonic: string;
      derivationPath?: string;
    }
  | {
      seed: string;
      derivationPath?: string;
    };

/**
 * Supported key types. Generally `sr25519` is preferred, but `ed25519` is more widely supported
 */
export type KeyRingType = 'sr25519' | 'ed25519';
