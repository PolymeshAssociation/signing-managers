import { encodeAddress } from '@polkadot/util-crypto';
import { HexString } from '@polkadot/util/types';
import {
  FireblocksSDK,
  PeerType,
  TransactionOperation,
  TransactionResponse,
  TransactionStatus,
} from 'fireblocks-sdk';
import { readFileSync } from 'fs';

import { DerivationPath, KeyInfo } from './types';

const algorithm = 'MPC_EDDSA_ED25519';

export class Fireblocks {
  public fireblocksSdk: FireblocksSDK;
  private addressBook: Record<string, KeyInfo> = {};
  private ss58Format = 0;
  private defaultKey?: KeyInfo;

  /**
   * @hidden
   */
  constructor(url: string, apiKey: string, secretPath: string) {
    const secret = readFileSync(secretPath, 'utf8');

    this.fireblocksSdk = new FireblocksSDK(secret, apiKey, url);
  }

  public async fetchAllKeys(): Promise<KeyInfo[]> {
    await this.fetchDefaultKey();

    return Object.values(this.addressBook);
  }

  public setSs58Format(ss58Format: number) {
    this.ss58Format = ss58Format;
  }

  /**
   * Retrieve the default public key for the Fireblocks account. Additional keys can be used by calling `deriveAccount`
   */
  private async fetchDefaultKey(): Promise<KeyInfo> {
    if (this.defaultKey) {
      return this.defaultKey;
    }

    const coinType = this.ss58Format === 12 ? 595 : 1;
    this.defaultKey = await this.deriveAccount([44, coinType, 0, 0, 0]);

    return this.defaultKey;
  }

  /**
   * This method can be called with a given derive path to enable signing with the given key
   */
  public async deriveAccount(path: DerivationPath): Promise<KeyInfo> {
    const pubKeyInfoArgs = {
      algorithm,
      derivationPath: `[${path}]`,
    };

    const key = await this.fireblocksSdk.getPublicKeyInfo(pubKeyInfoArgs);

    return this.encodeAndCacheKey(key);
  }

  /**
   * Returns information about an already derived account. `deriveAccount` must be called with the params that give this address
   */
  public lookupAddress(address: string): KeyInfo {
    const keyInfo = this.addressBook[address];

    if (!keyInfo) {
      throw new Error('The signer cannot sign transactions on behalf of the calling Account');
    }

    return keyInfo;
  }

  private encodeAndCacheKey(key: KeyInfo): KeyInfo {
    if (this.ss58Format === 0) {
      throw new Error('ss58 format must be set before a key can be encoded');
    }
    const address = encodeAddress(`0x${key.publicKey}`, this.ss58Format);
    key.address = address;
    this.addressBook[address] = key;
    return key;
  }

  /**
   * Sign data on behalf of a key and return the hex signature
   */
  public async signData(derivationPath: number[], data: string, note: string): Promise<HexString> {
    const signature = await this.signArbitraryMessage(derivationPath, data, note);
    // convert to hex and prepend 0x00 to indicate this is an ed25519 signature
    return `0x00${signature}`;
  }

  private async signArbitraryMessage(
    derivationPath: number[],
    message: string,
    note: string
  ): Promise<string> {
    const { status, id } = await this.fireblocksSdk.createTransaction({
      operation: TransactionOperation.RAW,
      source: {
        type: PeerType.VAULT_ACCOUNT,
      },
      extraParameters: {
        rawMessageData: {
          algorithm,
          messages: [
            {
              content: message,
              derivationPath,
            },
          ],
        },
      },
      note,
    });

    let currentStatus = status;
    let txInfo: TransactionResponse;

    // poll until the transaction is signed or rejected
    while (
      currentStatus !== TransactionStatus.COMPLETED &&
      currentStatus !== TransactionStatus.FAILED &&
      currentStatus !== TransactionStatus.CANCELLED &&
      currentStatus !== TransactionStatus.REJECTED &&
      currentStatus !== TransactionStatus.FAILED &&
      currentStatus !== TransactionStatus.TIMEOUT &&
      currentStatus !== TransactionStatus.BLOCKED
    ) {
      txInfo = await this.fireblocksSdk.getTransactionById(id);
      currentStatus = txInfo.status;

      await new Promise(r => setTimeout(r, 1000));
    }

    const signature = txInfo!?.signedMessages![0]?.signature;
    if (!signature) {
      throw new Error(`No signature on transaction with status: ${currentStatus}`);
    }

    return signature.fullSig;
  }
}
