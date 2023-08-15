import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { hexAddPrefix, hexToU8a, u8aToHex } from '@polkadot/util';
import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import {
  PolkadotSigner,
  signedExtensions,
  SigningManager,
} from '@polymeshassociation/signing-manager-types';
import { PublicKeyResonse } from 'fireblocks-sdk';

import { ConfigError, CreateParams, DerivationPath, KeyInfo, KeyNotFound } from './fireblocks';
import { defaultKeyPath, maxInitialDerivedAccounts } from './fireblocks/consts';
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
    const { address, version } = payload;

    const signablePayload = registry.createType('ExtrinsicPayload', payload, {
      version,
    });

    return this.signData(address, signablePayload.toU8a(true));
  }

  /**
   * Sign raw data
   */
  public async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {
    const { data, address } = raw;

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
    const note = `https://testnet-app.polymesh.live/#/extrinsics/decode/0x${Buffer.from(
      data
    ).toString('hex')}`;

    const { derivationPath } = await this.getFireblocksKeyInfo(address);

    const rawSignature = await this.fireblocks.signData(derivationPath, msg, note);
    // Add hex prefix and append 0 byte to indicate an ed25519 signature
    const signature = `0x00${rawSignature}` as const;

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
    const pubKey = u8aToHex(decodeAddress(address));

    const foundKey = this.fireblocks.lookupKey(pubKey);

    if (!foundKey) {
      throw new KeyNotFound('The signer cannot sign transactions on behalf of the calling Account');
    }

    return foundKey;
  }
}

export class FireblocksSigningManager implements SigningManager {
  public fireblocksClient: Fireblocks;
  private externalSigner: FireblocksSigner;
  private _ss58Format?: number;

  /**
   * @hidden
   */
  private constructor(args: Omit<CreateParams, 'derivationPaths'>) {
    const { url, apiKey, secret } = args;

    const registry = new TypeRegistry();
    registry.setSignedExtensions(signedExtensions);

    this.fireblocksClient = new Fireblocks({ url, apiKey, secret });
    this.externalSigner = new FireblocksSigner(this.fireblocksClient, registry);
  }

  public static async create(args: CreateParams): Promise<FireblocksSigningManager> {
    const signingManager = new FireblocksSigningManager(args);

    if (args.derivationPaths) {
      if (args.derivationPaths.length > maxInitialDerivedAccounts) {
        throw new ConfigError(
          `Number of initial derivation paths cannot exceed ${maxInitialDerivedAccounts}. Use deriveAccount after creation to load more accounts instead`
        );
      }

      const derivePromises = args.derivationPaths.map(path =>
        signingManager.fireblocksClient.deriveKey(path)
      );
      await Promise.all(derivePromises);
    } else {
      await signingManager.fireblocksClient.deriveKey(defaultKeyPath);
    }

    return signingManager;
  }

  /**
   * Set the SS58 format in which addresses will be encoded
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
  }

  public get ss58Format(): number {
    if (!this._ss58Format) {
      throw new ConfigError(
        'FireblocksSigningManager ss58Format was not set. The Polymesh SDK should set the format upon its initialization'
      );
    }

    return this._ss58Format;
  }

  /**
   * Return the addresses of all derived keys in Fireblocks
   */
  public async getAccounts(): Promise<string[]> {
    const allKeys = this.fireblocksClient.fetchDerivedKeys();

    const ss58Format = this.ss58Format;

    return allKeys.map(({ publicKey }) => encodeAddress(hexAddPrefix(publicKey), ss58Format));
  }

  /**
   * Derive an Account to be used for signing
   *
   * @note this method must be called with the derivation path for non default addresses before they can be used to sign
   */
  public async deriveAccount(path: DerivationPath): Promise<KeyInfo> {
    const key = await this.fireblocksClient.deriveKey(path);

    const address = encodeAddress(hexAddPrefix(key.publicKey), this.ss58Format);

    return { ...key, address };
  }

  /**
   * Return a signer object that uses the underlying keyring pairs to sign
   */
  public getExternalSigner(): PolkadotSigner {
    return this.externalSigner;
  }
}
