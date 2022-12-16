import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { hexToU8a } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';
import { PolkadotSigner, SigningManager } from '@polymeshassociation/signing-manager-types';
import { PublicKeyResonse } from 'fireblocks-sdk';
import { DerivationPath, KeyInfo } from './fireblocks';

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
   * Use the Fireblocks to sign raw data and return the signature
   */
  private async signData(address: string, data: Uint8Array): Promise<SignerResult> {
    const fixedData = data.length > 256 ? blake2AsU8a(data) : data;

    const msg = Buffer.from(fixedData).toString('hex');
    const note = `0x${Buffer.from(data).toString('hex')}`;

    const { derivationPath } = await this.getFireblocksKeyInfo(address);

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
   * Get Fireblocks key info by its SS58 encoded public key
   *
   * @throws if there is no key has been derived with that address
   */
  private async getFireblocksKeyInfo(address: string): Promise<PublicKeyResonse> {
    const foundKey = this.fireblocks.lookupAddress(address);

    if (!foundKey) {
      throw new Error('The signer cannot sign transactions on behalf of the calling Account');
    }

    return foundKey;
  }
}

export class FireblocksSigningManager implements SigningManager {
  private externalSigner: FireblocksSigner;
  public fireblocks: Fireblocks;

  /**
   * Create an instance of the FireblocksSigningManager
   *
   * @param args.url - points to where the Vault's transit engine is hosted (usually `<base-url>/v1/transit`)
   * @param args.token - authentication token used for signing
   * @param args.secretPath - File path to the fireblocks secret key to sign requests with
   */
  public constructor(args: { url: string; token: string; secretPath: string }) {
    const { url, token, secretPath } = args;

    this.fireblocks = new Fireblocks(url, token, secretPath);
    this.externalSigner = new FireblocksSigner(this.fireblocks, new TypeRegistry());
  }

  /**
   * Set the SS58 format in which addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this.fireblocks.setSs58Format(ss58Format);
  }

  /**
   * Return the addresses of all derived keys in Fireblocks
   */
  public async getAccounts(): Promise<string[]> {
    const allKeys = await this.fireblocks.fetchAllKeys();

    return allKeys.map(({ address }) => address);
  }

  /**
   * Derive an Account to be used for signing
   *
   * @note this method must be called with the derivation path for non default addresses before they can be used to sign
   */
  public async deriveAccount(path: DerivationPath): Promise<KeyInfo> {
    return this.fireblocks.deriveAccount(path);
  }

  /**
   * Return a signer object that uses the underlying keyring pairs to sign
   */
  public getExternalSigner(): PolkadotSigner {
    return this.externalSigner;
  }
}
