import { HexString } from '@polkadot/util/types';
import fetch from 'cross-fetch';

import {
  createWalletRoute,
  getWalletRoute,
  meshNetwork,
  routePrefix,
  signatureRoute,
} from './consts';
import {
  ApprovalStatus,
  GetSignatureResponse,
  Headers,
  KeyRecord,
  KeyRecordWithOwner,
  OwnerKeys,
  SignRequestBody,
} from './types';
import { sleep } from './utils';

export class ApprovalClient {
  private headers: Headers;
  private pollingInterval: number;

  /**
   * @hidden
   */
  constructor(
    /**
     * The url serving the API
     */
    private readonly url: string,
    /**
     * The client ID to be intended to be authorized for
     */
    private readonly apiClientId: string,
    /**
     * The apiKey to grant authorization
     */
    readonly apiKey: string,
    /**
     * The number of seconds to wait before checking for a signature. Note, each pending transaction will poll this often
     */
    pollingInterval: number
  ) {
    this.headers = {
      Authorization: apiKey,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
    };
    this.pollingInterval = pollingInterval * 1000; // convert to milliseconds
  }

  /**
   * Sign data on behalf of a key and return the hex signature
   * @note this method will continue to poll an endpoint until the transaction is approved. It may take a while for the promise to resolve
   *
   * @param ownerId - id of the key that will sign
   * @param message - the hex encoded data that will be signed
   */
  public async signData(ownerId: string, message: string): Promise<HexString> {
    const { headers, apiClientId } = this;

    const requestSignatureUrl = this.getUrl(signatureRoute);
    const payload: SignRequestBody = { message, apiClientId, ownerId };
    const body = JSON.stringify(payload);

    const response = await fetch(requestSignatureUrl, {
      method: 'POST',
      body,
      headers,
    });

    let responseJson = await this.readBody<GetSignatureResponse>(response);

    while (responseJson.approvalStatus === ApprovalStatus.Pending) {
      responseJson = await this.getSignature(responseJson.virtualHash);
      await sleep(this.pollingInterval);
    }

    const { signedMessage, signed } = responseJson;

    if (!signed || !signedMessage) {
      throw new Error(
        'The message was not signed and the request is no longer pending. The transaction has likely been rejected'
      );
    }

    // prepend a byte with value `0x01` to indicate this is an sr25519 signature
    const hexSignature = signedMessage.replace('0x', '');

    return `0x01${hexSignature}`;
  }

  /**
   * @hidden
   *
   * Assemble URL from separate path strings
   */
  private getUrl(...path: string[]) {
    return `${this.url}/${routePrefix}/${path.join('/')}`;
  }

  /**
   * Get the signature information for the given `virtualHash`
   */
  private async getSignature(virtualHash: string): Promise<GetSignatureResponse> {
    const { headers } = this;
    const url = this.getUrl(signatureRoute, virtualHash);

    const response = await fetch(url, { headers });
    return this.readBody<GetSignatureResponse>(response);
  }

  /**
   * Get the set of accounts accessible by the current API key
   */
  public async fetchKeys(): Promise<KeyRecordWithOwner[]> {
    const { headers } = this;
    const url = this.getUrl(getWalletRoute, this.apiClientId);

    const response = await fetch(url, { headers });
    const keys = await this.readBody<OwnerKeys[]>(response);

    return keys.flatMap(({ ownerId, accounts }) =>
      accounts
        .filter(({ network }) => network === meshNetwork)
        .map(account => ({ ...account, ownerId }))
    );
  }

  /**
   * Get the set of accounts belonging to the given `ownerId`
   */
  public async fetchOwnerKeys(ownerId: string): Promise<KeyRecordWithOwner[]> {
    const { headers } = this;
    const url = this.getUrl(getWalletRoute, this.apiClientId, ownerId);

    const response = await fetch(url, { headers });
    const keys = await this.readBody<OwnerKeys>(response);

    return keys.accounts.filter(isMeshNetwork).map(account => ({ ...account, ownerId }));
  }

  /**
   *
   * @param ownerId - The identifier that will be given to the wallet
   * @returns - The created key information
   */
  public async createWallet(ownerId: string): Promise<KeyRecordWithOwner[]> {
    const { headers, apiClientId } = this;
    const url = this.getUrl(createWalletRoute);
    const body = JSON.stringify({ ownerId, apiClientId });
    const response = await fetch(url, {
      method: 'POST',
      body,
      headers,
    });
    const responseBody = await this.readBody<OwnerKeys>(response);

    return responseBody.accounts.filter(isMeshNetwork).map(account => ({ ...account, ownerId }));
  }

  /**
   * Ensures the response was successful, returns the response body as json
   *
   * @note the type param `T` acts as a type assertion for the response, no runtime checks are performed to ensure the response conforms to the expectation
   *
   * @throws if the status code was not in the 2xx range
   */
  private async readBody<T>(res: Response): Promise<T> {
    const { status, statusText } = res;
    const body = await res.json();

    if (status >= 300) {
      const { message } = body;
      throw new Error(
        `Approval client response error: ${status} - ${statusText}. Reason(s): ${message}`
      );
    }

    return body;
  }
}

const isMeshNetwork = ({ network }: KeyRecord) => network === meshNetwork;
