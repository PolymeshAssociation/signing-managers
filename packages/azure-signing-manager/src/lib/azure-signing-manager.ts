import { CreateKeyOptions } from '@azure/keyvault-keys';
import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import {
  PolkadotSigner,
  signedExtensions,
  SigningManager,
} from '@polymeshassociation/signing-manager-types';

import { AddressedAzureKey, AzureSigningManagerArgs } from '../types';
import { AzureHsm, AzureSignerError } from './azure-hsm';

export class AzureSigner implements PolkadotSigner {
  private currentId = -1;

  constructor(private readonly azure: AzureHsm, private readonly registry: TypeRegistry) {}

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    const { address, version } = payload;
    const { registry } = this;

    const signablePayload = registry.createType('ExtrinsicPayload', payload, {
      version,
    });

    return this.signData(address, signablePayload.toU8a(true));
  }

  public async signRaw(raw: SignerPayloadRaw): Promise<SignerResult> {
    const { address, data } = raw;

    return this.signData(address, hexToU8a(data));
  }

  /**
   * @hidden
   *
   * Use the Azure HSM to sign raw data and return the signature + update ID
   */
  private async signData(address: string, data: Uint8Array): Promise<SignerResult> {
    const pubKey = u8aToHex(decodeAddress(address));

    const fixedData = data.length > 256 ? blake2AsU8a(data) : data;

    const signature = await this.azure.signData(pubKey, fixedData);

    const id = (this.currentId += 1);

    return {
      signature,
      id,
    };
  }
}

/**
 * Enables signing Polymesh SDK transactions using a Microsoft Azure key vault
 *
 * @note only elliptic curve keys on P-256K are valid Polymesh. Any other key type will be ignored
 */
export class AzureSigningManager implements SigningManager {
  private readonly azureHsm: AzureHsm;
  private readonly externalSigner: PolkadotSigner;
  private _ss58Format?: number;

  constructor(args: AzureSigningManagerArgs) {
    const registry = new TypeRegistry();
    registry.setSignedExtensions(signedExtensions);

    this.azureHsm = new AzureHsm(args);
    this.externalSigner = new AzureSigner(this.azureHsm, registry);
  }

  /**
   * Creates a key with the given name
   *
   * @note keys must use the P-256K curve (aka secp256k1)
   *
   * @throws AzureSignerError if the name is already used
   *
   * @returns key details
   */
  public async createKey(name: string, options?: CreateKeyOptions): Promise<AddressedAzureKey> {
    if (options?.curve && options.curve !== 'P-256K') {
      throw new AzureSignerError({
        message: 'Only curve P-256K is supported on Polymesh',
        data: { curve: options.curve },
      });
    }

    const ss58Format = this.getSs58Format('createKey');

    const key = await this.azureHsm.createKey(name, options);

    return {
      ...key,
      address: encodeAddress(key.publicKey, ss58Format),
    };
  }

  /**
   * @note `getAzureKeys` returns additional details
   *
   * @returns all addresses stored in the key vault
   */
  public async getAccounts(): Promise<string[]> {
    const ss58Format = this.getSs58Format('getAccounts');
    const keys = await this.azureHsm.fetchAllKeys();

    return keys.map(({ publicKey }) => encodeAddress(publicKey, ss58Format));
  }

  /**
   *
   * @returns signer compatible implementing polkadot-js signer interface
   */
  public getExternalSigner(): PolkadotSigner {
    return this.externalSigner;
  }

  /**
   * Sets the ss58 format so addresses can be properly formatted. This must be called before other methods are usable
   *
   * @note The Polymesh SDK will call this method internally. This only needs to be called if the SDK is not being used
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
  }

  /**
   * @returns Details about all available signing keys within the key vault
   */
  public async getAzureKeys(): Promise<AddressedAzureKey[]> {
    const ss58Format = this.getSs58Format('getVaultKeys');
    const keys = await this.azureHsm.fetchAllKeys();

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
      throw new AzureSignerError({
        message: `Cannot call '${methodName}' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?`,
      });
    }

    return format;
  }
}
