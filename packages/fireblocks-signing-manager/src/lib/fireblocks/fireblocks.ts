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

import { GetKeyResponse } from './types';

const algorithm = 'MPC_EDDSA_ED25519';

export class Fireblocks {
  public fireblocksSdk: FireblocksSDK;
  private addressBook: Record<string, GetKeyResponse> = {};
  private ss58Format = -1;

  /**
   * @hidden
   */
  constructor(url: string, apiKey: string, secretPath: string) {
    const secret = readFileSync(secretPath, 'utf8');

    this.fireblocksSdk = new FireblocksSDK(secret, apiKey, url);
  }

  /**
   * Retrieve all public keys (hex) stored in the Vault with their respective names and versions
   */
  public async fetchAllKeys(): Promise<GetKeyResponse[]> {
    const coinType = '1'; // 595 for mainnet

    const numVaults = 12; // stores the first 12 keys
    const promises = [];
    for (let i = 0; i < numVaults; i++) {
      const path = [44, coinType, i, 0, 0].toString();
      const pubKeyInfoArgs = {
        algorithm,
        derivationPath: `[${path}]`,
      };
      promises.push(this.fireblocksSdk.getPublicKeyInfo(pubKeyInfoArgs));
    }
    const keys = await Promise.all(promises);

    const withAddress = keys.map(this.encodeAndCacheKey);

    return withAddress;
  }

  public setSs58Format(ss58Format: number) {
    this.ss58Format = ss58Format;
  }

  /**
   * This method can be called with a given derive path to enable signing with the given key
   */
  public async fetchDerivePath(derivationPath: string): Promise<GetKeyResponse> {
    const pubKeyInfoArgs = {
      algorithm,
      derivationPath,
    };
    const key = await this.fireblocksSdk.getPublicKeyInfo(pubKeyInfoArgs);
    const addressedKey = this.encodeAndCacheKey(key);

    return addressedKey;
  }

  public async fetchAddress(address: string): Promise<GetKeyResponse> {
    const res = this.addressBook[address];
    if (!res) {
      throw new Error(`Could not find an available signer for address: ${address}`);
    }

    return res;
  }

  private encodeAndCacheKey(key: GetKeyResponse): GetKeyResponse {
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
    const apiClient = this.fireblocksSdk;

    const { status, id } = await apiClient.createTransaction({
      operation: TransactionOperation.RAW,
      source: {
        type: PeerType.VAULT_ACCOUNT,
      },
      extraParameters: {
        note,
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
    });

    let currentStatus = status;
    let txInfo: TransactionResponse;

    // poll until the transaction is signed or rejected
    while (
      currentStatus !== TransactionStatus.COMPLETED &&
      currentStatus !== TransactionStatus.FAILED &&
      currentStatus !== TransactionStatus.BLOCKED
    ) {
      txInfo = await apiClient.getTransactionById(id);
      currentStatus = txInfo.status;

      await new Promise(r => setTimeout(r, 1000));
    }

    const signature = txInfo!.signedMessages![0].signature;

    return signature.fullSig;
  }
}
