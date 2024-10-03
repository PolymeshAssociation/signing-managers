import {
  CryptographyClient,
  KeyClient,
  KeyProperties,
  KeyVaultKey,
  KnownSignatureAlgorithms,
} from '@azure/keyvault-keys';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { when } from 'jest-when';

import { AzureHsm } from './azure-hsm';
import { AzureSignerError } from './types';
import { createPagedAsyncIterableIterator } from './util';

const mockKeyClient = createMock<KeyClient>();
const mockCryptographyClient = createMock<CryptographyClient>();
const mockKeyVaultKey = createMock<KeyVaultKey>();

jest.mock('@azure/keyvault-keys', () => ({
  ...jest.requireActual('@azure/keyvault-keys'),
  KeyClient: jest.fn().mockImplementation(() => mockKeyClient),
  CryptographyClient: jest.fn().mockImplementation(() => mockCryptographyClient),
  KeyVaultKey: jest.fn().mockImplementation(() => mockKeyVaultKey),
}));

describe('AzureHsm', () => {
  let azure: AzureHsm;
  let mockKey: DeepMocked<KeyVaultKey>;
  let mockNewKey: DeepMocked<KeyVaultKey>;
  let mockPartialKey: DeepMocked<KeyVaultKey>;

  const x = Buffer.from('d6eb9ae6b44331da8c92a0bd88850b94c7f32981aaf42d1c1345e05af810470a', 'hex');
  const y = Buffer.from('7b4603950822dd8806494a3aff5d6bc2e437b71f7c7de64e9d84a60411dc1293', 'hex');
  const publicKey = '0x63eb973f33ad5737a1ea2e4100c04e806c403b5994d986f0c71a2fd80dbbd179';

  beforeEach(() => {
    azure = new AzureHsm({ keyVaultUrl: 'https://example.com' });

    mockKey = createMock<KeyVaultKey>({
      key: { x, y, crv: 'P-256K' },
      properties: { version: 'v1' },
    });
    mockNewKey = createMock<KeyVaultKey>({
      key: { x, y, crv: 'P-256K' },
      properties: { version: 'v1' },
    });
    mockPartialKey = createMock<KeyVaultKey>({
      key: { x: undefined, y: undefined, crv: 'P-256K' },
      properties: { version: 'v1' },
    });

    const mockKeyProperties: KeyProperties = {
      name: 'someKey',
      vaultUrl: 'http://example.com/keyOne',
      version: 'v1',
    };

    const mockIterator = createPagedAsyncIterableIterator([mockKeyProperties]);

    mockKeyClient.listPropertiesOfKeys.mockReturnValue(mockIterator);
    mockKeyClient.listPropertiesOfKeyVersions.mockReturnValue(
      createPagedAsyncIterableIterator([mockKey.properties])
    );

    mockKeyClient.getKey.mockRejectedValue({ code: 'KeyNotFound' });

    mockKeyClient.createKey.mockImplementation(async name => {
      when(mockKeyClient.getKey).calledWith(name, { version: 'v1' }).mockResolvedValue(mockKey);
      when(mockKeyClient.listPropertiesOfKeyVersions)
        .calledWith(name)
        .mockReturnValue(createPagedAsyncIterableIterator([{ ...mockKeyProperties, name }]));

      return mockKey;
    });
    when(mockKeyClient.getKey).calledWith('someKey', { version: 'v1' }).mockResolvedValue(mockKey);

    when(mockKeyClient.getKey)
      .calledWith('partialKey', { version: 'v1' })
      .mockResolvedValue(mockPartialKey);

    mockCryptographyClient.sign.mockResolvedValue({
      result: Buffer.from(
        'b4b24959854a6afdba21e1007955c6c728725009feab9886408d6dc4fb9712e3ab5f30be4f06d2f12f01a10ccd374278d44ab133ed8ee5998341034f9347f156',
        'hex'
      ),
      algorithm: KnownSignatureAlgorithms.ES256K,
    });

    mockKeyClient.getCryptographyClient.mockReturnValue(mockCryptographyClient);
  });

  describe('createKey', () => {
    it('should create a key', async () => {
      const result = await azure.createKey('newKey');

      expect(result).toEqual(
        expect.objectContaining({
          name: 'newKey',
          keyVaultKey: mockNewKey,
        })
      );
    });
  });

  describe('fetchAllKeys', () => {
    it('should return all of the keys', async () => {
      const result = await azure.fetchAllKeys();

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'someKey', keyVaultKey: mockKey })])
      );
    });
  });

  describe('getAzureKeyByPubKey', () => {
    it('should return the key', async () => {
      const key = await azure.getAzureKeyByPubKey(publicKey);

      expect(key).toEqual(expect.objectContaining({ name: 'someKey', keyVaultKey: mockKey }));
    });
  });

  describe('getAzureKey', () => {
    it('should return the azure key', async () => {
      const result = await azure.getAzureKeyVersions('someKey');

      expect(result).toEqual(
        expect.arrayContaining([expect.objectContaining({ name: 'someKey', keyVaultKey: mockKey })])
      );
    });

    it('should return empty array if key is not found', () => {
      return expect(azure.getAzureKeyVersions('unknownKey')).resolves.toEqual([]);
    });

    it('should throw an error if the key is missing details', async () => {
      const expectedError = new AzureSignerError({ message: 'essential key details missing' });

      return expect(azure.getAzureKeyVersions('partialKey')).rejects.toThrow(expectedError);
    });
  });

  describe('signData', () => {
    it('should sign the data', async () => {
      const bytes = Buffer.from('00', 'hex');

      const result = await azure.signData(publicKey, bytes);

      expect(result).toEqual(
        '0x02b4b24959854a6afdba21e1007955c6c728725009feab9886408d6dc4fb9712e3ab5f30be4f06d2f12f01a10ccd374278d44ab133ed8ee5998341034f9347f15601'
      );
    });
  });
});
