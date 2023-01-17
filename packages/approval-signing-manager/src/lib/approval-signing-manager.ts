import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import { hexToU8a } from '@polkadot/util';
import { blake2AsU8a, decodeAddress } from '@polkadot/util-crypto';
import {
  PolkadotSigner,
  signedExtensions,
  SigningManager,
} from '@polymeshassociation/signing-manager-types';

import { ApprovalClient } from './approval-client/approval-client';
import { KeyRecordWithOwner } from './approval-client/types';

/**
 * A signer compatible with the polkadot.js library directly. If using the polymesh SDK you should use `ApprovalSigningManager` instead
 */
export class ApprovalSigner implements PolkadotSigner {
  private currentId = -1;

  /**
   * @hidden
   */
  constructor(
    private readonly approvalClient: ApprovalClient,
    private readonly registry: TypeRegistry
  ) {}

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
    const { address, data } = raw;

    return this.signData(address, hexToU8a(data));
  }

  /**
   * @hidden
   *
   * Get a signature from the approval key store. This may take a while as the approval process may require human approval
   */
  private async signData(address: string, data: Uint8Array): Promise<SignerResult> {
    const fixedData = data.length > 256 ? blake2AsU8a(data) : data;

    const message = `0x${Buffer.from(fixedData).toString('hex')}`;

    const { ownerId } = await this.getKeyRecord(address);
    const signature = await this.approvalClient.signData(ownerId, message);

    const id = (this.currentId += 1);

    return {
      signature,
      id,
    };
  }

  /**
   * @hidden
   *
   * Get a key from the key store
   *
   * @param address - SS58 formatted address
   *
   * @throws if there is no key with that address
   * @note this fetches all the keys to find the right one. If the API had an address to owner lookup this could be more efficient
   */
  private async getKeyRecord(address: string): Promise<KeyRecordWithOwner> {
    const allKeys = await this.approvalClient.fetchKeys();

    const foundKey = allKeys.find(({ address: keyAddress }) => keyAddress === address);

    if (!foundKey) {
      throw new Error('The signer cannot sign transactions on behalf of the calling Account');
    }

    return foundKey;
  }
}

/**
 * A signing manager for the Polymesh SDK. This delegates signature generation to an external API that may manually approve transactions
 *
 * @note the backing API is not open sourced, but it can be reversed engineered by looking at the code if you want to use this manager as it is
 */
export class ApprovalSigningManager implements SigningManager {
  private approvalClient: ApprovalClient;
  private externalSigner: ApprovalSigner;
  private _ss58Format?: number;

  /**
   * Create an instance of the Approval Signing Manager
   *
   * @param args.url - where the backing API is hosted
   * @param args.apiClientId - the id intended to authorize for
   * @param args.apiKey - authorization token
   * @param args.pollingInterval - (default: 15) the number of seconds to wait between polling for approval for each pending transaction
   */
  public constructor(args: {
    url: string;
    apiClientId: string;
    apiKey: string;
    pollingInterval?: number;
  }) {
    const { url, apiClientId, apiKey, pollingInterval = 15 } = args;

    const registry = new TypeRegistry();
    registry.setSignedExtensions(signedExtensions);

    this.approvalClient = new ApprovalClient(url, apiClientId, apiKey, pollingInterval);
    this.externalSigner = new ApprovalSigner(this.approvalClient, registry);
  }

  /**
   * Set the SS58 format in which returned addresses will be encoded (For Polymesh chains: 12 for mainnet, 42 otherwise)
   */
  public setSs58Format(ss58Format: number): void {
    this._ss58Format = ss58Format;
  }

  /**
   * Return the addresses of all Accounts accessible to the configured API key
   */
  public async getAccounts(): Promise<string[]> {
    const keys = await this.approvalClient.fetchKeys();

    this.assertCorrectSs58Format(keys, 'getAccounts');

    return keys.map(({ address }) => address);
  }

  /**
   * Return a signer object compatible with the polkadot.js library
   */
  public getExternalSigner(): PolkadotSigner {
    return this.externalSigner;
  }

  /**
   * Return the API client. Used to make direct calls to the backing API
   */
  public getApprovalClient(): ApprovalClient {
    return this.approvalClient;
  }

  /**
   * @hidden
   *
   * Check the address' ss58 format. This ensures test and production environments cannot get mixed up
   *
   * @throws if a key is not of the correct ss58 format
   */
  private assertCorrectSs58Format(keys: KeyRecordWithOwner[], methodName: string): void {
    // `decodeAddress` *should* throw if there is a mismatch between ss58 formats
    keys.forEach(({ address }) => decodeAddress(address, false, this.getSs58Format(methodName)));
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
