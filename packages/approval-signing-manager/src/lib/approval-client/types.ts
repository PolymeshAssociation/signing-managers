/**
 * Signable data as expected by the Vault API
 */
export interface SignRequestBody {
  /**
   * base64 encoded data to sign
   */
  message: string;

  /**
   * The ID of the owner
   */
  ownerId: string;

  /**
   * The client ID
   */
  apiClientId: string;
}

/**
 * Response representing a signature request. The approval process may require a person so the status change may take hours
 */
export interface GetSignatureResponse {
  id: string;
  virtualHash: string;
  apiClientId: string;
  approvalStatus: string;
  message: string;
  signedMessage: string;
  ownerId: string;
  signed: boolean;
}

/**
 * Response returned when retrieving keys held available for signing with
 */
export interface OwnerKeys {
  /**
   * The keys available to sign with
   */
  accounts: KeyRecord[];

  /**
   * The api client record
   */
  apiClientId: string;

  /**
   * The owner of the key
   */
  ownerId: string;

  /**
   * An internal identifier
   */
  _id: string;
}

/**
 * A record representing a private key stored in the signer
 */
export interface KeyRecord {
  /**
   * The network this key is for. Note this is idiosyncratic to the API this was written against which is multi-chain
   */
  network: string;

  /**
   * The SS58 encoded public associated to the stored private key
   */
  address: string;

  /**
   * An internal identifier
   */
  _id: string;
}

export interface KeyRecordWithOwner extends KeyRecord {
  /**
   * The owner of the key record
   */
  ownerId: string;
}

export type Headers = { Authorization: string; 'Content-Type': 'application/json' };
