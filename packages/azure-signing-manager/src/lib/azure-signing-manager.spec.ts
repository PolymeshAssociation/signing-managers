import { CryptographyClient, KeyClient, KeyProperties, KeyVaultKey } from '@azure/keyvault-keys';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON } from '@polkadot/types/types';
import { when } from 'jest-when';

import { AzureHsm, AzureSignerError, createPagedAsyncIterableIterator } from './azure-hsm';
import { AzureSigner, AzureSigningManager } from './azure-signing-manager';

const mockKeyClient = createMock<KeyClient>();
const mockCryptographyClient = createMock<CryptographyClient>();
const mockKeyVaultKey = createMock<KeyVaultKey>();

jest.mock('@azure/keyvault-keys', () => ({
  ...jest.requireActual('@azure/keyvault-keys'),
  KeyClient: jest.fn().mockImplementation(() => mockKeyClient),
  CryptographyClient: jest.fn().mockImplementation(() => mockCryptographyClient),
  KeyVaultKey: jest.fn().mockImplementation(() => mockKeyVaultKey),
}));

const address = '5EKiakuf6cT9RZ3oJKto4EKhprtx6afUu5LJozeidGGBGkqy';

describe('AzureSigner', () => {
  const payload: SignerPayloadJSON = {
    address,
    specVersion: '0x00000bba',
    transactionVersion: '0x00000002',
    blockHash: '0xdf06dca982acacbd5f0bcd7a8a062465b8441d569813561ed13ab81883bc08e7',
    blockNumber: '0x00000280',
    era: '0x0500',
    genesisHash: '0x44748824f9798715435c421b5db9af2beae537974d192fab5fb6fc12e1523765',
    method: '0x1a005041594c4f41445f54455354',
    nonce: '0x00000004',
    signedExtensions: [
      'CheckSpecVersion',
      'CheckTxVersion',
      'CheckGenesis',
      'CheckMortality',
      'CheckNonce',
      'CheckWeight',
      'ChargeTransactionPayment',
    ],
    tip: '0x00000000000000000000000000000002',
    version: 4,
  };
  const signature = '0x123';

  let signer: AzureSigner;
  let mockHsm: DeepMocked<AzureHsm>;

  beforeEach(() => {
    const registry = new TypeRegistry();
    mockHsm = createMock<AzureHsm>();
    mockHsm.signData.mockResolvedValue(signature);
    signer = new AzureSigner(mockHsm, registry);
  });

  it('should sign a payload', async () => {
    const result = await signer.signPayload(payload);

    expect(result).toEqual({ id: 0, signature });
  });

  it('should sign a raw payload', async () => {
    const raw = {
      address,
      data: '0x00',
      type: 'bytes' as const,
    };

    const result = await signer.signRaw(raw);

    expect(result).toEqual({ id: 0, signature });
  });
});

describe('AzureSigningManager', () => {
  let manager: AzureSigningManager;
  const x = Buffer.from('d6eb9ae6b44331da8c92a0bd88850b94c7f32981aaf42d1c1345e05af810470a', 'hex');
  const y = Buffer.from('7b4603950822dd8806494a3aff5d6bc2e437b71f7c7de64e9d84a60411dc1293', 'hex');

  const x2 = Buffer.from('0931923491ba255a837c47785b4092ff5c47ea6f9fcc2a40f772b3c0d88844c4', 'hex');
  const y2 = Buffer.from('ec1e690e2bf86850421417853fd60526695303c299ecc4f3c9a6a75b11a2e405', 'hex');
  const address2 = '5Fhw9c3rCD1KWSqHpLgnRHwjQJNcYVNLCjJXuHVuzw9VL1t7';

  beforeEach(() => {
    const mockKeyProperties: KeyProperties = { name: 'someKey', version: 'v1', vaultUrl: '' };
    const mockKey2Properties: KeyProperties = { name: 'someKey', version: 'v2', vaultUrl: '' };

    const mockKeyDetails = [
      { name: 'someKey', vaultUrl: 'http://example.com', properties: mockKeyProperties },
    ];

    mockKeyClient.listPropertiesOfKeys.mockReturnValue(
      createPagedAsyncIterableIterator(mockKeyDetails)
    );

    mockKeyClient.listPropertiesOfKeyVersions.mockReturnValue(
      createPagedAsyncIterableIterator([mockKeyProperties, mockKey2Properties])
    );

    mockKeyClient.getKey.mockRejectedValue({ code: 'KeyNotFound' });

    when(mockKeyClient.getKey)
      .calledWith('someKey', { version: 'v1' })
      .mockResolvedValue(createMock<KeyVaultKey>({ key: { x, y, crv: 'P-256K' } }));

    when(mockKeyClient.getKey)
      .calledWith('someKey', { version: 'v2' })
      .mockResolvedValue(createMock<KeyVaultKey>({ key: { x: x2, y: y2, crv: 'P-256K' } }));

    mockKeyClient.createKey.mockImplementation(async name => {
      const mockKey = createMock<KeyVaultKey>({
        key: { x, y, crv: 'P-256K' },
        properties: { version: 'v1' },
      });

      mockKeyDetails.push({ name, vaultUrl: 'http://example.com', properties: mockKey.properties });

      mockKeyClient.listPropertiesOfKeys.mockReturnValue(
        createPagedAsyncIterableIterator(mockKeyDetails)
      );

      when(mockKeyClient.listPropertiesOfKeyVersions)
        .calledWith(name)
        .mockReturnValue(createPagedAsyncIterableIterator([mockKey.properties]));

      when(mockKeyClient.getKey).calledWith(name, { version: 'v1' }).mockResolvedValue(mockKey);

      return mockKey;
    });

    manager = new AzureSigningManager({ keyVaultUrl: 'https://example.com' });
  });

  describe('createKey', () => {
    it('should call create key', async () => {
      manager.setSs58Format(42);
      const result = await manager.createKey('someNewKey');

      expect(result).toEqual(expect.objectContaining({ name: 'someNewKey' }));
    });

    it('should throw an error if creating a key that already exists', () => {
      manager.setSs58Format(42);
      const expectedError = new AzureSignerError({
        message: 'key already exists with the given name',
      });

      return expect(manager.createKey('someKey')).rejects.toThrow(expectedError);
    });

    it('should throw an error if ss58 format is not set', async () => {
      const expectedError = new AzureSignerError({
        message:
          "Cannot call 'createKey' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?",
      });

      return expect(manager.createKey('someNewKey')).rejects.toThrow(expectedError);
    });
  });

  describe('getAccounts', () => {
    it('should return all of the accounts', async () => {
      manager.setSs58Format(42);
      const result = await manager.getAccounts();

      expect(result).toEqual([address, address2]);
    });

    it('should throw an error if ss58 format was not set', async () => {
      return expect(manager.getAccounts()).rejects.toThrow(
        "Cannot call 'getAccounts' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('getExternalSigner', () => {
    it('should return the external signer', () => {
      const result = manager.getExternalSigner();

      expect(result).toBeInstanceOf(AzureSigner);
    });
  });

  describe('setSs58Format', () => {
    it('should set the ss58Format', () => {
      expect(() => manager.setSs58Format(42)).not.toThrow();
    });
  });
});
