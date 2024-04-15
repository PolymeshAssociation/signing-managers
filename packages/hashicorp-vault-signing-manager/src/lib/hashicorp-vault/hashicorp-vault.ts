import { HexString } from '@polkadot/util/types';
import fetch from 'cross-fetch';

import {
  GetKeyResponse,
  ListKeysResponse,
  SignRequestPayload,
  SignResponse,
  VaultKey,
} from './types';

export class HashicorpVault {
  private headers: { 'X-Vault-Token': string };

  /**
   * @hidden
   */
  constructor(private readonly url: string, token: string) {
    this.headers = {
      'X-Vault-Token': token,
    };
  }

  /**
   * @hidden
   *
   * Assemble URL from separate path strings
   */
  private getUrl(...path: string[]) {
    return `${this.url}/${path.join('/')}`;
  }

  /**
   * Retrieve all public keys (hex) stored in the Vault with their respective names and versions
   */
  public async fetchAllKeys(): Promise<VaultKey[]> {
    const { headers } = this;

    const response = await fetch(this.getUrl('keys'), {
      method: 'LIST',
      headers,
    });

    // Vault returns 404 for empty lists for [ease of implementation](https://github.com/hashicorp/vault/issues/1365#issuecomment-216369253)
    if (response.status === 404) {
      return [];
    }

    await this.assertResponseOk(response);

    const {
      data: { keys },
    }: ListKeysResponse = await response.json();

    const allKeys = await Promise.all(keys.map(name => this.fetchKeysByName(name)));

    return allKeys.flat();
  }

  /**
   * Retrieve all the public keys (hex formatted) associated to a name, and their versions
   *
   * @param name - name of the key for which to fetch the public keys
   */
  public async fetchKeysByName(name: string): Promise<VaultKey[]> {
    const { headers } = this;

    const response = await fetch(this.getUrl('keys', name), {
      method: 'GET',
      headers,
    });

    await this.assertResponseOk(response);

    const {
      data: { keys },
    }: GetKeyResponse = await response.json();

    return Object.entries(keys)
      .filter(([, { name }]) => name === 'ed25519') // N.B response "name" is the encryption type
      .map(([version, { public_key: publicKey }]) => {
        const hexKey = Buffer.from(publicKey, 'base64').toString('hex');

        return {
          publicKey: `0x${hexKey}`,
          version: Number(version),
          name,
        };
      });
  }

  /**
   * Sign data on behalf of a key and return the hex signature
   *
   * @param name - name of the key that will sign
   * @param version - version of the named key to use
   * @param data - data that will be signed
   */
  public async signData(name: string, data: SignRequestPayload): Promise<HexString> {
    const { headers } = this;

    const response = await fetch(this.getUrl('sign', name), {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });

    await this.assertResponseOk(response);

    const {
      data: { signature },
    }: SignResponse = await response.json();

    // strip vault prefix
    const strippedSignature = signature.replace(/vault:v\d+:/, '');

    // convert to hex and prepend 0x00 to indicate this is an ed25519 signature
    const hexSignature = Buffer.from(strippedSignature, 'base64').toString('hex');

    return `0x00${hexSignature}`;
  }

  /**
   *
   * @param res
   */
  private async assertResponseOk(res: Response): Promise<void> {
    const { status, statusText } = res;

    if (![200, 204].includes(status)) {
      const { errors = [] } = await res.json();
      const reasons = errors.length
        ? `. Reason(s): "${errors.join('", "').replace(/[\n\t*]/g, '')}"`
        : '';
      throw new Error(`Vault response error: ${status} - ${statusText}${reasons}`);
    }
  }
}
