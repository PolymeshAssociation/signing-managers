import { DefaultAzureCredential } from '@azure/identity';
import {
  CreateKeyOptions,
  CryptographyClient,
  KeyClient,
  KeyVaultKey,
  KnownSignatureAlgorithms,
} from '@azure/keyvault-keys';
import { u8aToHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { ecdsaRecover } from 'secp256k1';

import { AzureSigningManagerArgs } from '../../types';
import { AzureKey, AzureSignerError } from './types';
import { bufferToCompressedKey } from './util';

export class AzureHsm {
  private readonly credential: DefaultAzureCredential;
  private readonly keyClient: KeyClient;

  private pubKeyCache: Record<string, AzureKey> = {};

  /**
   * @hidden
   */
  constructor(args: AzureSigningManagerArgs) {
    const { keyVaultUrl, credential } = args;

    this.credential = credential ?? new DefaultAzureCredential();
    this.keyClient = new KeyClient(keyVaultUrl, this.credential);
  }

  public async createKey(name: string, options?: CreateKeyOptions): Promise<AzureKey> {
    const existingKeys = await this.getAzureKeyVersions(name);
    if (existingKeys.length !== 0) {
      throw new AzureSignerError({
        message: 'key already exists with the given name',
        data: { name },
      });
    }

    await this.keyClient.createKey(name, 'EC', { ...options, curve: 'P-256K' });

    const key = await this.getAzureKeyVersions(name);
    if (key.length === 0) {
      throw new AzureSignerError({ message: 'created key was not found by name', data: { name } });
    }

    return key[0];
  }

  /**
   * Fetches a list of all keys, then fetches all versions of each key and filters for EC P-256K keys
   *
   * @note performance may suffer with key vaults containing thousands of keys. Please open a Github issue if this is a concern
   *
   * @returns all available signing keys
   */
  public async fetchAllKeys(): Promise<AzureKey[]> {
    const { keyClient } = this;

    for await (const { name } of keyClient.listPropertiesOfKeys()) {
      await this.getAzureKeyVersions(name); // use the side effect of cache population
    }

    return Object.values(this.pubKeyCache);
  }

  public async getAzureKeyByPubKey(publicKey: string): Promise<AzureKey> {
    const cachedKey = this.pubKeyCache[publicKey];

    if (cachedKey) {
      return cachedKey;
    }

    // Try refetching in case the key was newly added
    await this.fetchAllKeys();

    const newKey = this.pubKeyCache[publicKey];

    if (!newKey) {
      throw new AzureSignerError({
        message: 'signing key was not found',
        data: { publicKey },
      });
    }

    return newKey;
  }

  /**
   * @note this method will filter non EC P-256K keys since their signatures are not supported on Polymesh
   *
   * @returns all versions for the given key name
   */
  public async getAzureKeyVersions(name: string): Promise<AzureKey[]> {
    const azureKeys: AzureKey[] = [];

    for await (const keyProperties of this.keyClient.listPropertiesOfKeyVersions(name)) {
      const keyVaultKey = await this.getKeyVaultKey(name, keyProperties.version);

      if (!keyVaultKey) {
        continue;
      }

      const { key, id, properties } = keyVaultKey;

      // Non P-256K keys are not supported so we will just ignore them
      if (key?.crv !== 'P-256K') {
        continue;
      }

      if (!key) {
        throw new AzureSignerError({ message: 'key details were not found', data: { name } });
      }

      const { x, y } = key;

      if (!x || !y || !id) {
        throw new AzureSignerError({
          message: 'essential key details missing',
          data: { name, id, x: u8aToHex(x), y: u8aToHex(y) },
        });
      }

      const keyBuffer = Buffer.concat([Buffer.from([0x04]), x, y]);
      const publicKey = bufferToCompressedKey(keyBuffer);

      const azureKey = {
        name,
        id,
        publicKey,
        properties,
        keyVaultKey,
      };

      this.setPubkeyCache(azureKey);

      azureKeys.push(azureKey);
    }

    return azureKeys;
  }

  /**
   * Sign data on behalf of a key and return the hex signature
   *
   * @param publicKey the hex formatted public key to sign with e.g. `0x63eb973f33ad5737a1ea2e4100c04e806c403b5994d986f0c71a2fd80dbbd179`
   * @param data - data that will be signed
   */
  public async signData(pubKey: string, signingPayload: Uint8Array): Promise<HexString> {
    const standardPayload =
      signingPayload.length > 256 ? blake2AsU8a(signingPayload) : signingPayload;

    const encoded = blake2AsU8a(standardPayload);

    const {
      name,
      publicKey,
      properties: { version },
    } = await this.getAzureKeyByPubKey(pubKey);

    const cryptoClient = this.getCryptoClient(name, version);
    const { result: signatureRs } = await cryptoClient.sign(
      KnownSignatureAlgorithms.ES256K,
      encoded
    );

    // Compute the recovery ID
    let recoveryId = null;
    let lastError: Error | null = null;
    for (let recId = 0; recId < 2; recId++) {
      try {
        const recoveredPubKey = ecdsaRecover(signatureRs, recId, encoded, false); // Uncompressed

        const recoveredKey = bufferToCompressedKey(recoveredPubKey);

        if (Buffer.compare(recoveredKey, publicKey) === 0) {
          recoveryId = recId;
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(JSON.stringify(error));
        continue;
      }
    }

    if (recoveryId === null) {
      throw new AzureSignerError({
        message: 'Failed to compute recovery ID',
        data: { name, publicKey: publicKey.toString('hex'), lastError },
      });
    }

    // Construct the signature: [r (32 bytes), s (32 bytes), recoveryId (1 byte)]
    const signatureWithRecovery = Buffer.concat([signatureRs, Buffer.from([recoveryId])]);

    // Prefix with 0x02 to indicate ECDSA signature
    const ecdsaSignature = Buffer.concat([Buffer.from([2]), signatureWithRecovery]);

    return `0x${ecdsaSignature.toString('hex')}`;
  }

  /**
   * @hidden
   */
  private async getKeyVaultKey(name: string, version?: string): Promise<KeyVaultKey | undefined> {
    return this.keyClient.getKey(name, { version }).catch(error => {
      if (error.code === 'KeyNotFound') {
        return undefined;
      }

      throw error;
    });
  }

  private setPubkeyCache(key: AzureKey): void {
    const cacheKey = `0x${key.publicKey.toString('hex')}`;

    this.pubKeyCache[cacheKey] = key;
  }

  /**
   * @hidden
   */
  private getCryptoClient(name: string, keyVersion?: string): CryptographyClient {
    return this.keyClient.getCryptographyClient(name, { keyVersion });
  }
}
