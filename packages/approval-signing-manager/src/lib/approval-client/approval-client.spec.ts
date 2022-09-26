import fetch from 'cross-fetch';
import { Key } from 'readline';

import { ApprovalClient } from './approval-client';
import { createMockResponse } from './mocks';
import { KeyRecord } from './types';

jest.mock('cross-fetch', () => jest.fn());

const fetchStub = fetch as jest.Mock;

describe('ApprovalClient class', () => {
  const url = 'http://localhost';
  const ownerId = 'someOwnerId';
  const apiClientId = 'someId';
  const token = 'someToken';

  const accountResponse: KeyRecord[] = [
    {
      address: '0x01000',
      network: 'polymesh',
      _id: '1',
    },
    {
      address: '0x02000',
      network: 'polymesh',
      _id: '2',
    },
    {
      address: '0x3000',
      network: 'polymesh',
      _id: '3',
    },
  ];

  const otherNetworkAccounts: KeyRecord[] = [{ address: '0x04000', network: 'ethereum', _id: '4' }];

  let client: ApprovalClient;

  beforeEach(() => {
    client = new ApprovalClient(url, apiClientId, token, 1);
  });

  describe('method: fetchKeys', () => {
    it('should return all accessible keys', async () => {
      fetchStub.mockResolvedValue(
        createMockResponse(200, 'Ok', [
          {
            apiClientId,
            ownerId,
            accounts: [...accountResponse, ...otherNetworkAccounts],
          },
        ])
      );

      const result = await client.fetchKeys();
      expect(result).toMatchSnapshot();
    });

    it('should throw any errors returned by the Approver API', () => {
      fetchStub.mockResolvedValue(
        createMockResponse(400, 'Bad Request', {
          message: 'Something went wrong',
        })
      );
      return expect(client.fetchKeys()).rejects.toThrow(
        `Approval client response error: 400 - Bad Request. Reason(s): Something went wrong`
      );
    });
  });

  describe('method: fetchOwnerKeys', () => {
    it('should return all keys under the passed owner', async () => {
      fetchStub.mockResolvedValueOnce(
        createMockResponse(200, 'Ok', {
          accounts: [accountResponse[0], otherNetworkAccounts[0]],
        })
      );

      const result = await client.fetchOwnerKeys(ownerId);
      expect(result).toMatchSnapshot();
    });
  });

  describe('method: signData', () => {
    it('should return signed data', async () => {
      fetchStub
        .mockResolvedValueOnce(
          createMockResponse(200, 'Ok', {
            approvalStatus: 'pending',
            virtualHash: '123',
            signed: false,
          })
        )
        .mockResolvedValueOnce(
          createMockResponse(200, 'Ok', {
            approvalStatus: 'approved',
            virtualHash: '123',
            signed: true,
            signedMessage: '0xabc',
          })
        );

      const result = await client.signData('Alice', 'adba32==');

      expect(result).toBe('0x01abc');
    });

    it('should throw if the transaction is rejected', () => {
      fetchStub
        .mockResolvedValueOnce(
          createMockResponse(200, 'Ok', {
            approvalStatus: 'pending',
            virtualHash: '123',
            signed: false,
          })
        )
        .mockResolvedValueOnce(
          createMockResponse(200, 'Ok', {
            approvalStatus: 'rejected',
            virtualHash: '123',
            signed: false,
          })
        );

      return expect(client.signData('Alice', 'adba32==')).rejects.toThrowErrorMatchingSnapshot();
    });

    it('should throw any errors returned by the Approver API', () => {
      fetchStub.mockResolvedValue(
        createMockResponse(400, 'Bad Request', {
          message: 'THE END IS NIGH',
        })
      );

      return expect(client.fetchKeys()).rejects.toThrow(
        `Approval client response error: 400 - Bad Request. Reason(s): THE END IS NIGH`
      );
    });
  });

  describe('method: createWallet', () => {
    it('should call the endpoint to create a wallet', async () => {
      fetchStub.mockResolvedValue(
        createMockResponse(200, 'Ok', {
          apiClientId,
          ownerId,
          accounts: [
            {
              network: 'eth',
              token: 'eth',
              address: '0x3f9e4839005593f9fEb30FC7f87a777396c36106',
              _id: '62fc2a617cbb5b9ecbaff97d',
            },
            {
              network: 'polymesh',
              token: 'polyx',
              address: '5GdqFHLLxZt2u6HokFLBnyopDnGsS2sCBod4vUZTQ7YYx',
              _id: '62fc2a617cbb5b9ecbaff97f',
            },
          ],
        })
      );

      const result = await client.createWallet(ownerId);

      expect(result).toMatchSnapshot();
    });
  });
});
