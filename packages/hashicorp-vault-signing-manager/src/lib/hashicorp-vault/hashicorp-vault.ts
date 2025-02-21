import { HexString } from '@polkadot/util/types';
import fetch from 'cross-fetch';

import { SignerTimeoutError } from '../../types';
import {
  GetKeyResponse,
  ListKeysResponse,
  SignRequestPayload,
  SignResponse,
  VaultKey,
} from './types';

const TIMEOUT = 30 * 1000;

export class HashicorpVault {
  private readonly headers: { 'X-Vault-Token': string; 'X-Vault-Namespace'?: string };

  /**
   * @hidden
   */
  constructor(private readonly url: string, token: string, namespace?: string) {
    this.headers = {
      'X-Vault-Token': token,
    };
    if (namespace) {
      this.headers['X-Vault-Namespace'] = namespace;
    }
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
    const url = this.getUrl('keys');

    const response = await this.fetch(url, 'LIST');

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
    const url = this.getUrl('keys', name);
    const response = await this.fetch(url, 'GET');

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
    const response = await this.fetch(this.getUrl('sign', name), 'POST', data);

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

  private async fetch(url: string, method: string, body?: unknown): Promise<Response> {
    const { headers } = this;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);

    try {
      const response = await fetch(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers,
        signal: controller.signal,
      });

      return response;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new SignerTimeoutError({
          message: 'Hashicorp Vault request timed out',
          data: {
            timeoutSeconds: TIMEOUT / 1000,
            url,
          },
        });
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timer);
    }
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
