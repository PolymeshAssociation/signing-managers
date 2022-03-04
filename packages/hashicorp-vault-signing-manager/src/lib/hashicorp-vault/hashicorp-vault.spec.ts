import fetch from 'cross-fetch';

import { VaultKey } from '.';
import { HashicorpVault } from './hashicorp-vault';
import { createMockResponse } from './mocks';

jest.mock('cross-fetch', () => jest.fn());

const fetchStub = fetch as jest.Mock;

describe('HashicorpVault class', () => {
  const url = 'http://localhost';
  const token = 'someToken';

  const expectedKeys: VaultKey[] = [
    {
      name: 'Alice',
      publicKey: '0x72a5a53f6a04459a8e8ed266cc048db7f8c8d3faac0204f99ed593400bad636c',
      version: 1,
    },
    {
      name: 'Alice',
      publicKey: '0xec2624ca769be5bc57cd23f0f1d8c06a0f68ac06a57e00355361d45000af7c28',
      version: 2,
    },
    {
      name: 'Bob',
      publicKey: '0x1af337073aac07c2622ba393854850341cff112d5d6380def23ee323b0d48802',
      version: 1,
    },
  ];

  let vault: HashicorpVault;

  beforeEach(() => {
    vault = new HashicorpVault(url, token);
  });

  describe('method: fetchAllKeys', () => {
    it('should return all keys stored in the vault', async () => {
      fetchStub
        .mockResolvedValueOnce(
          createMockResponse(200, 'Ok', {
            data: {
              keys: ['Alice', 'Bob'],
            },
          })
        )
        .mockResolvedValueOnce(
          createMockResponse(200, 'Ok', {
            data: {
              keys: {
                '1': {
                  public_key: 'cqWlP2oERZqOjtJmzASNt/jI0/qsAgT5ntWTQAutY2w=',
                },
                '2': {
                  public_key: '7CYkynab5bxXzSPw8djAag9orAalfgA1U2HUUACvfCg=',
                },
              },
            },
          })
        )
        .mockResolvedValueOnce(
          createMockResponse(200, 'Ok', {
            data: {
              keys: {
                '1': {
                  public_key: 'GvM3BzqsB8JiK6OThUhQNBz/ES1dY4De8j7jI7DUiAI=',
                },
              },
            },
          })
        );

      const result = await vault.fetchAllKeys();

      expect(result).toEqual(expectedKeys);
    });

    it('should throw any errors returned by the vault API', () => {
      fetchStub.mockResolvedValue(
        createMockResponse(400, 'Bad Request', {
          errors: ['Something went wrong'],
        })
      );

      return expect(vault.fetchAllKeys()).rejects.toThrow(
        `Vault response error: 400 - Bad Request. Reason(s): "Something went wrong"`
      );
    });
  });

  describe('method: fetchKeysByName', () => {
    it('should return all keys under the passed name', async () => {
      fetchStub.mockResolvedValueOnce(
        createMockResponse(200, 'Ok', {
          data: {
            keys: {
              '1': {
                public_key: 'cqWlP2oERZqOjtJmzASNt/jI0/qsAgT5ntWTQAutY2w=',
              },
              '2': {
                public_key: '7CYkynab5bxXzSPw8djAag9orAalfgA1U2HUUACvfCg=',
              },
            },
          },
        })
      );

      const result = await vault.fetchKeysByName('Alice');

      expect(result).toEqual([expectedKeys[0], expectedKeys[1]]);
    });

    it('should throw any errors returned by the vault API', () => {
      fetchStub.mockResolvedValue(createMockResponse(400, 'Bad Request', {}));

      return expect(vault.fetchAllKeys()).rejects.toThrow(
        `Vault response error: 400 - Bad Request`
      );
    });
  });

  describe('method: signData', () => {
    it('should return signed data', async () => {
      fetchStub.mockResolvedValueOnce(
        createMockResponse(200, 'Ok', {
          data: {
            signature:
              'vault:v1:MEUCIQCyb869d7KWuA0hBM9b5NJrmWzMW3/pT+0XYCM9VmGR+QIgWWF6ufi4OS2xo1eS2V5IeJQfsi59qeMWtgX0LipxEHI=',
          },
        })
      );

      const result = await vault.signData('Alice', {
        // cSpell: disable-next-line
        input: 'adba32==',
        key_version: 2,
      });

      expect(result).toBe(
        '0x003045022100b26fcebd77b296b80d2104cf5be4d26b996ccc5b7fe94fed1760233d566191f9022059617ab9f8b8392db1a35792d95e4878941fb22e7da9e316b605f42e2a711072'
      );
    });

    it('should throw any errors returned by the vault API', () => {
      fetchStub.mockResolvedValue(
        createMockResponse(400, 'Bad Request', {
          errors: ['THE END IS NIGH'],
        })
      );

      return expect(vault.fetchAllKeys()).rejects.toThrow(
        `Vault response error: 400 - Bad Request. Reason(s): "THE END IS NIGH"`
      );
    });
  });
});
