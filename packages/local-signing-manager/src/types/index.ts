/**
 * URI|mnemonic|hex representation of a private key
 */
export type PrivateKey = ({ uri: string } | { mnemonic: string } | { seed: string }) & {
  /**
   * (optional) a specify a derivation path to apply to the secret. This allows for multiple accounts to be created with only one secret
   *
   * @note if using this option the account can only be recreated by knowing the path and the secret. Be sure to use a consistent scheme when making the path
   */
  derivationPath?: string;
};

/**
 * Supported key types. Generally `sr25519` is preferred, but `ed25519` is more widely supported
 */
export type KeyRingType = 'sr25519' | 'ed25519';
