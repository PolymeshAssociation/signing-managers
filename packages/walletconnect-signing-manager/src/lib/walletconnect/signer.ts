import type { SignerPayloadJSON, SignerPayloadRaw, SignerResult } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import { PolkadotSigner } from '@polymeshassociation/signing-manager-types';
import SignClient from '@walletconnect/sign-client';
import type { SessionTypes } from '@walletconnect/types';

interface Signature {
  signature: HexString;
}

export class WalletConnectSigner implements PolkadotSigner {
  client: SignClient;
  session: SessionTypes.Struct;
  chainId?: string;
  id = 0;

  public constructor(client: SignClient, session: SessionTypes.Struct) {
    this.client = client;
    this.session = session;
  }
  /**
   * Sets the chainId used for signRaw
   *
   * @param genesisHash
   */
  public setChainIdFromGenesisHash = (genesisHash: string) => {
    this.chainId = `polkadot:${genesisHash.replace('0x', '').substring(0, 32)}`;
  };

  /**
   * Creates and sends a wallet connect signing request
   * @param payload The transaction payload for signing
   * @returns Signed result
   */
  public signPayload = async (payload: SignerPayloadJSON): Promise<SignerResult> => {
    const request = {
      topic: this.session.topic,
      chainId: `polkadot:${payload.genesisHash.replace('0x', '').substring(0, 32)}`,
      request: {
        id: 1,
        jsonrpc: '2.0',
        method: 'polkadot_signTransaction',
        params: { address: payload.address, transactionPayload: payload },
      },
    };

    const { signature } = await this.client.request<Signature>(request);

    return { id: ++this.id, signature };
  };

  /**
   * Creates and sends a wallet connect raw message signing request
   * @param raw The raw payload for signing
   * @returns signed result
   */
  public signRaw = async (raw: SignerPayloadRaw): Promise<SignerResult> => {
    if (!this.chainId) {
      throw new Error('chainId not found. Use setGenesisHash to configure the chainId');
    }
    const request = {
      topic: this.session.topic,
      chainId: this.chainId,
      request: {
        id: 1,
        jsonrpc: '2.0',
        method: 'polkadot_signMessage',
        params: { address: raw.address, message: raw.data },
      },
    };

    const { signature } = await this.client.request<Signature>(request);

    return { id: ++this.id, signature };
  };
}
