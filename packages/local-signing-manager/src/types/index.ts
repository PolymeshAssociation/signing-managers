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
