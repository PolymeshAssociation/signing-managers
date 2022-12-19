import { HexString } from '@polkadot/util/types';
import {
  FireblocksSDK,
  PeerType,
  PublicKeyResonse,
  TransactionOperation,
  TransactionResponse,
  TransactionStatus,
} from 'fireblocks-sdk';
import { readFileSync } from 'fs';

import { DerivationPath, KeyInfo, NoTransactionSignature } from './types';

const algorithm = 'MPC_EDDSA_ED25519';

export class Fireblocks {
  /**
   * the authenticated [FireblocksSDK instance](https://www.npmjs.com/package/fireblocks-sdk) to allow full interaction with their API
   */
  public fireblocksSdk: FireblocksSDK;
  private addressBook: Record<HexString, PublicKeyResonse> = {};

  public constructor(args: { url: string; apiKey: string; secretPath: string }) {
    const { secretPath, apiKey, url } = args;

    const secret = readFileSync(secretPath, 'utf8');

    this.fireblocksSdk = new FireblocksSDK(secret, apiKey, url);
  }

  public fetchDerivedKeys(): PublicKeyResonse[] {
    return Object.values(this.addressBook);
  }

  /**
   * Derive a key from a derivation path, allowing it to sign requests
   */
  public async deriveKey(path: DerivationPath): Promise<PublicKeyResonse> {
    const pubKeyInfoArgs = {
      algorithm,
      derivationPath: `[${path}]`,
    };

    const key = await this.fireblocksSdk.getPublicKeyInfo(pubKeyInfoArgs);

    this.cacheKey(key);

    return key;
  }

  public lookupKey(pubKey: HexString): PublicKeyResonse | undefined {
    return this.addressBook[pubKey];
  }

  /**
   * Sign data on behalf of a key and return the signature
   */
  public async signData(derivationPath: number[], data: string, note: string): Promise<string> {
    return this.signArbitraryMessage(derivationPath, data, note);
  }

  private async signArbitraryMessage(
    derivationPath: number[],
    message: string,
    note: string
  ): Promise<string> {
    const { id } = await this.fireblocksSdk.createTransaction({
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

    let currentStatus;
    let txInfo: TransactionResponse;

    // poll until the transaction is signed or rejected
    for (;;) {
      txInfo = await this.fireblocksSdk.getTransactionById(id);
      currentStatus = txInfo.status;

      if (this.isCompletedTransaction(txInfo)) {
        break;
      }

      await new Promise(r => setTimeout(r, 1000));
    }

    const signature = txInfo?.signedMessages?.[0]?.signature;
    if (!signature) {
      throw new NoTransactionSignature(
        `Fireblocks transaction response with status: "${currentStatus}" had no signature`
      );
    }

    return signature.fullSig;
  }

  private cacheKey(key: KeyInfo): void {
    this.addressBook[`0x${key.publicKey}`] = key;
  }

  private isCompletedTransaction(tx: TransactionResponse): boolean {
    return [
      TransactionStatus.COMPLETED,
      TransactionStatus.FAILED,
      TransactionStatus.CANCELLED,
      TransactionStatus.REJECTED,
      TransactionStatus.FAILED,
      TransactionStatus.TIMEOUT,
      TransactionStatus.BLOCKED,
    ].includes(tx.status);
  }
}
