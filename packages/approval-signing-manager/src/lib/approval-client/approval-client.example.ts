/* istanbul ignore file */

/**
 * Example file demonstrating calls on the API client
 */

import { ApprovalClient } from '.';

const url = 'https://example.com';
const ownerId = 'someOwnerId';
const apiClientId = 'someClientId';
const apiKey = 'someApiSecret';

const main = async () => {
  const client = new ApprovalClient(url, apiClientId, apiKey, 15);

  const createResponse = await client.createWallet(ownerId);
  console.log('createWallet response: ', createResponse);

  const getKeys = await client.fetchKeys();
  console.log('fetchKeys response: ', getKeys);

  const ownerKeys = await client.fetchOwnerKeys(ownerId);
  console.log('fetchOwnerKeys response: ', ownerKeys);

  /** The backing API needs to approve the transaction before this resolves  */
  const signResponse = await client.signData(ownerId, 'Some base64 encoded Polymesh transaction');
  console.log('signData response: ', signResponse);
};

main();
