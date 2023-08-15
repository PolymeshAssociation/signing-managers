import { TransactionResponse, TransactionStatus } from 'fireblocks-sdk';

import { Fireblocks } from './fireblocks';
import { DerivationPath, NoTransactionSignature } from './types';

const algorithm = 'MPC_EDDSA_ED25519';

jest.mock('fs');

describe('Fireblocks class', () => {
  const url = 'http://example.com';
  const apiKey = 'someToken';
  const secret = 'someSecret';

  const defaultKey = {
    status: 0,
    publicKey: '0100000000000000000000000000000000000000000000000000000000000000',
    algorithm,
    derivationPath: [44, 1, 0, 0, 0] as DerivationPath,
  };
  const key1 = {
    status: 0,
    publicKey: '0200000000000000000000000000000000000000000000000000000000000000',
    algorithm,
    derivationPath: [44, 1, 1, 0, 0] as DerivationPath,
  };
  const key2 = {
    status: 0,
    publicKey: '0300000000000000000000000000000000000000000000000000000000000000',
    algorithm,
    derivationPath: [44, 1, 2, 0, 0] as DerivationPath,
  };

  let fireblocks: Fireblocks;

  beforeEach(() => {
    fireblocks = new Fireblocks({ url, apiKey, secret });
  });

  describe('method: fetchAllKeys', () => {
    it('should return no keys if none have been derived', async () => {
      const result = fireblocks.fetchDerivedKeys();

      expect(result).toEqual([]);
    });

    it('should return derived keys', async () => {
      const publicKeySpy = jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo');

      publicKeySpy.mockResolvedValue(key1);
      await fireblocks.deriveKey(key1.derivationPath);

      publicKeySpy.mockResolvedValue(key2);
      await fireblocks.deriveKey(key2.derivationPath);

      const result = fireblocks.fetchDerivedKeys();

      expect(result).toEqual(expect.arrayContaining([key1, key2]));
    });
  });

  describe('method: deriveKey', () => {
    it('should return the key', async () => {
      jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo').mockResolvedValue(key1);

      const key = await fireblocks.deriveKey(key1.derivationPath);

      expect(key).toEqual(key1);
    });
  });

  describe('method: signData', () => {
    it('should return signed data', async () => {
      jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo').mockResolvedValue(defaultKey);

      jest
        .spyOn(fireblocks.fireblocksSdk, 'createTransaction')
        .mockResolvedValue({ id: '1', status: TransactionStatus.PENDING_AUTHORIZATION });

      const expectedSignature = '123';

      const getTxSpy = jest.spyOn(fireblocks.fireblocksSdk, 'getTransactionById');

      getTxSpy.mockResolvedValueOnce({
        id: '1',
        status: TransactionStatus.PENDING_SIGNATURE,
      } as TransactionResponse);
      getTxSpy.mockResolvedValueOnce({
        id: '1',
        status: TransactionStatus.COMPLETED,
        signedMessages: [{ signature: { fullSig: expectedSignature } }],
      } as TransactionResponse);

      const result = await fireblocks.signData(defaultKey.derivationPath, 'test data', 'test note');

      expect(getTxSpy).toHaveBeenCalledTimes(2);
      expect(result).toBe(expectedSignature);
    });

    it('should throw an error if a transaction is rejected', async () => {
      jest
        .spyOn(fireblocks.fireblocksSdk, 'createTransaction')
        .mockResolvedValue({ id: '1', status: TransactionStatus.PENDING_AUTHORIZATION });

      jest.spyOn(fireblocks.fireblocksSdk, 'getTransactionById').mockResolvedValue({
        id: '1',
        status: TransactionStatus.REJECTED,
      } as TransactionResponse);

      const expectedError = new NoTransactionSignature(
        'Fireblocks transaction response with status: "REJECTED" had no signature'
      );

      await expect(
        fireblocks.signData(defaultKey.derivationPath, 'test data', 'test note')
      ).rejects.toThrowError(expectedError);
    });
  });
});
