import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { PolkadotSigner, SigningManager } from '@polymeshassociation/signing-manager-types';
import { PublicKeyResonse } from 'fireblocks-sdk';

import { Fireblocks } from './fireblocks/fireblocks';

export class FireblocksSigner implements PolkadotSigner {
  private currentId = -1;

  /**
   * @hidden
   */
  constructor(private readonly fireblocks: Fireblocks, private readonly registry: TypeRegistry) {}

  /**
   * Sign a payload
   */
  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    const { registry } = this;
    const { address, signedExtensions, version } = payload;

    registry.setSignedExtensions(signedExtensions);

    const signablePayload = registry.createType('ExtrinsicPayload', payload, {
      version,
    });

    return this.signData(address, signablePayload.toU8a(true));
  }

  /**
   * Sign raw data
   */
  public async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {
    const { address, data } = raw;

    return this.signData(address, hexToU8a(data));
  }

  /**
   * @hidden
   *
   * Use the Vault to sign raw data and return the signature + update ID
   */
  private async signData(address: string, data: Uint8Array): Promise<SignerResult> {
    const fixedData = data.length > 256 ? blake2AsU8a(data) : data;

    const msg = Buffer.from(fixedData).toString('hex');
    const note = fixedData.toString();

    const { derivationPath } = await this.getFireblocksKey(address);

    const signature = await this.fireblocks.signData(derivationPath, msg, note);

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
  private async getFireblocksKey(address: string): Promise<PublicKeyResonse> {
    const payloadPublicKey = u8aToHex(decodeAddress(address));

    const allKeys = await this.fireblocks.fetchAllKeys();

    const foundKey = allKeys.find(({ publicKey }) => `0x${publicKey}` === payloadPublicKey);

    if (!foundKey) {
      throw new Error('The signer cannot sign transactions on behalf of the calling Account');
    }

    return foundKey;
  }
}
export class FireblocksSigningManager implements SigningManager {
  private externalSigner: FireblocksSigner;
  public fireblocks: Fireblocks;
  private _ss58Format?: number;

  /**
   * Create an instance of the Hashicorp Vault Signing Manager
   *
   * @param args.url - points to where the Vault's transit engine is hosted (usually `<base-url>/v1/transit`)
   * @param args.token - authentication token used for signing
   */
  public constructor(args: { url: string; token: string; secretPath: string }) {
    const { url, token, secretPath } = args;

    this.fireblocks = new Fireblocks(url, token, secretPath);
    this.externalSigner = new FireblocksSigner(this.fireblocks, new TypeRegistry());
  }

  /**
   * Set the SS58 format in which returned addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
    this.fireblocks.setSs58Format(ss58Format);
  }

  /**
   * Return the addresses of all Accounts in the Hashicorp Vault
   *
   * @throws if called before calling `setSs58Format`. Normally, `setSs58Format` will be called by the SDK when instantiated
   */
  public async getAccounts(): Promise<string[]> {
    this.getSs58Format('getAccounts'); // ensure ss58Format is set

    const keys = await this.fireblocks.fetchAllKeys();

    return keys.map(({ address }) => address);
  }

  /**
   * Return a signer object that uses the underlying keyring pairs to sign
   */
  public getExternalSigner(): PolkadotSigner {
    return this.externalSigner;
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
