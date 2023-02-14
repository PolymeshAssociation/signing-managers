/**
 * URI|mnemonic|hex representation of a private key
 */
export type PrivateKey = ({ uri: string } | { mnemonic: string } | { seed: string }) & {
  /**
   * (optional) specify a derivation path for the secret. As a result, multiple accounts can be created with a single secret
   *
   * @note With this option, the account can be recreated only by knowing the path and the secret. Be sure to use a consistent scheme when making the path
   */
  derivationPath?: string;
};

/**
 * Supported key types. Generally `sr25519` is preferred, but `ed25519` is more widely supported
 */
export type KeyRingType = 'sr25519' | 'ed25519';
