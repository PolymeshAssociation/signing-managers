import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import {
  PolkadotSigner,
  signedExtensions,
  SigningManager,
} from '@polymeshassociation/signing-manager-types';

import { AddressedVaultKey } from '../types';
import { HashicorpVault, VaultKey } from './hashicorp-vault';

export class VaultSigner implements PolkadotSigner {
  private currentId = -1;
  /**
   * This can be invalid in the event of a key rename in Vault
   */
  private addressCache: Record<string, VaultKey> = {};

  /**
   * @hidden
   */
  constructor(private readonly vault: HashicorpVault, private readonly registry: TypeRegistry) {}

  /**
   * Sign a payload
   */
  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    const { registry } = this;
    const { address, version } = payload;

    const { name, version: keyVersion } = await this.getVaultKey(address);

    const signablePayload = registry.createType('ExtrinsicPayload', payload, {
      version,
    });

    return this.signData(name, keyVersion, signablePayload.toU8a(true)).catch(error => {
      this.clearAddressCache(address);
      throw error;
    });
  }

  /**
   * Sign raw data
   */
  public async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {
    const { address, data } = raw;

    const { name, version } = await this.getVaultKey(address);

    return this.signData(name, version, hexToU8a(data)).catch(error => {
      this.clearAddressCache(address);
      throw error;
    });
  }

  /**
   * @hidden
   *
   * Use the Vault to sign raw data and return the signature + update ID
   */
  private async signData(name: string, version: number, data: Uint8Array): Promise<SignerResult> {
    const fixedData = data.length > 256 ? blake2AsU8a(data) : data;

    const body = {
      input: Buffer.from(fixedData).toString('base64'),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      key_version: version,
    };

    const signature = await this.vault.signData(name, body);

    const id = (this.currentId += 1);

    return {
      signature,
      id,
    };
  }

  /**
   * @hidden
   *
   * Get a key from the Vault
   *
   * @param address - SS58 formatted address
   *
   * @throws if there is no key with that address
   */
  private async getVaultKey(address: string): Promise<VaultKey> {
    const cachedKey = this.getCachedKey(address);
    if (cachedKey) {
      return cachedKey;
    }

    const payloadPublicKey = u8aToHex(decodeAddress(address));

    const allKeys = await this.vault.fetchAllKeys();

    const foundKey = allKeys.find(({ publicKey }) => publicKey === payloadPublicKey);

    if (!foundKey) {
      throw new Error('The signer cannot sign transactions on behalf of the calling Account');
    }

    this.setCachedKey(address, foundKey);

    return foundKey;
  }

  private getCachedKey(address: string): VaultKey {
    return this.addressCache[address];
  }

  private setCachedKey(address: string, key: VaultKey): void {
    this.addressCache[address] = key;
  }

  private clearAddressCache(address: string): void {
    delete this.addressCache[address];
  }
}
export class HashicorpVaultSigningManager implements SigningManager {
  private externalSigner: VaultSigner;
  private vault: HashicorpVault;
  private _ss58Format?: number;

  /**
   * Create an instance of the Hashicorp Vault Signing Manager
   *
   * @param args.url - points to where the Vault's transit engine is hosted (usually `<base-url>/v1/transit`)
   * @param args.token - authentication token used for signing
   */
  public constructor(args: { url: string; token: string }) {
    const { url, token } = args;

    const registry = new TypeRegistry();
    registry.setSignedExtensions(signedExtensions);

    this.vault = new HashicorpVault(url, token);
    this.externalSigner = new VaultSigner(this.vault, registry);
  }

  /**
   * Set the SS58 format in which returned addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
  }

  /**
   * Return the addresses of all Accounts in the Hashicorp Vault
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccounts(): Promise<string[]> {
    const ss58Format = this.getSs58Format('getAccounts');

    const keys = await this.vault.fetchAllKeys();

    return keys.map(({ publicKey }) => encodeAddress(publicKey, ss58Format));
  }

  /**
   * Return a signer object that uses the underlying keyring pairs to sign
   */
  public getExternalSigner(): PolkadotSigner {
    return this.externalSigner;
  }

  /**
   * Return the information about each key available to sign extrinsics with in the Hashicorp Vault.
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getVaultKeys(): Promise<AddressedVaultKey[]> {
    const ss58Format = this.getSs58Format('getVaultKeys');
    const keys = await this.vault.fetchAllKeys();
    return keys.map(key => ({
      ...key,
      address: encodeAddress(key.publicKey, ss58Format),
    }));
  }

  /**
   * @hidden
   *
   * @throws if the SS58 format hasn't been set yet
   */
  private getSs58Format(methodName: string): number {
    const { _ss58Format: format } = this;

    if (format === undefined) {
      throw new Error(
        `Cannot call '${methodName}' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?`
      );
    }

    return format;
  }
}
