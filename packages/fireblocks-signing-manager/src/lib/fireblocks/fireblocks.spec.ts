import { TransactionResponse, TransactionStatus } from 'fireblocks-sdk';

import { Fireblocks } from './fireblocks';
import { DerivationPath } from './types';

const algorithm = 'MPC_EDDSA_ED25519';

jest.mock('fs');

describe('Fireblocks class', () => {
  const url = 'http://example.com';
  const token = 'someToken';
  const secretPath = './some-secret.key';

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
    fireblocks = new Fireblocks(url, token, secretPath);
    fireblocks.setSs58Format(42);
  });

  describe('method: fetchAllKeys', () => {
    it('should return the default key', async () => {
      const publicKeySpy = jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo');
      publicKeySpy.mockResolvedValue(defaultKey);

      const result = await fireblocks.fetchAllKeys();

      expect(result).toEqual([defaultKey]);

      publicKeySpy.mockRestore();
    });

    it('should return derived keys', async () => {
      const publicKeySpy = jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo');

      publicKeySpy.mockResolvedValue(key1);
      await fireblocks.deriveAccount(key1.derivationPath);
      publicKeySpy.mockResolvedValue(key2);
      await fireblocks.deriveAccount(key2.derivationPath);

      publicKeySpy.mockResolvedValueOnce(defaultKey);

      const result = await fireblocks.fetchAllKeys();

      expect(result).toEqual(expect.arrayContaining([defaultKey, key1, key2]));

      publicKeySpy.mockRestore();
    });
  });

  describe('method: deriveKey', () => {
    it('should throw if ss58Format is not set', () => {
      fireblocks.setSs58Format(0);
      const publicKeySpy = jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo');

      publicKeySpy.mockResolvedValue(key1);

      const expectedError = new Error('ss58 format must be set before a key can be encoded');

      expect(fireblocks.deriveAccount(key1.derivationPath)).rejects.toThrowError(expectedError);

      publicKeySpy.mockRestore();
    });
  });

  describe('method: signData', () => {
    it('should return signed data', async () => {
      const publicKeySpy = jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo');
      publicKeySpy.mockResolvedValue(defaultKey);

      await fireblocks.fetchAllKeys();

      const createTxSpy = jest.spyOn(fireblocks.fireblocksSdk, 'createTransaction');

      createTxSpy.mockResolvedValue({ id: '1', status: TransactionStatus.PENDING_AUTHORIZATION });

      const getTxSpy = jest.spyOn(fireblocks.fireblocksSdk, 'getTransactionById');

      const expectedSignature = '123';
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
      expect(result).toBe(`0x00${expectedSignature}`);

      publicKeySpy.mockRestore();
      createTxSpy.mockRestore();
      getTxSpy.mockRestore();
    });

    it('should throw an error if a transaction is rejected', async () => {
      const publicKeySpy = jest.spyOn(fireblocks.fireblocksSdk, 'getPublicKeyInfo');
      publicKeySpy.mockResolvedValue(defaultKey);

      await fireblocks.fetchAllKeys();

      const createTxSpy = jest.spyOn(fireblocks.fireblocksSdk, 'createTransaction');

      createTxSpy.mockResolvedValue({ id: '1', status: TransactionStatus.REJECTED });

      const expectedError = new Error('No signature on transaction with status: REJECTED');

      expect(
        fireblocks.signData(defaultKey.derivationPath, 'test data', 'test note')
      ).rejects.toThrowError(expectedError);
    });
  });
});
