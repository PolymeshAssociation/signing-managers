import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { stringToU8a, u8aToHex } from '@polkadot/util';

import { HashicorpVault } from './hashicorp-vault';
import { mockHashicorpVault } from './hashicorp-vault/mocks';
import { HashicorpVaultSigningManager, VaultSigner } from './hashicorp-vault-signing-manager';

jest.mock('./hashicorp-vault', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  HashicorpVault: function () {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./hashicorp-vault/mocks').mockHashicorpVault;
  },
}));

const url = 'http://vault/v1/transit';
const token = 'someAuthToken';
const accounts = [
  {
    name: 'Alice',
    address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
    publicKey: '0x72a5a53f6a04459a8e8ed266cc048db7f8c8d3faac0204f99ed593400bad636c',
    version: 1,
  },
  {
    name: 'Bob',
    address: '5HQLVKFYkytr9HisQRWoUArUWw8YNWUmhLdXztRFjqysiNUx',
    publicKey: '0xec2624ca769be5bc57cd23f0f1d8c06a0f68ac06a57e00355361d45000af7c28',
    version: 2,
  },
  {
    name: 'Charlie',
    address: '5Cg3MNhhuPD5UUjXjjKNszzXic5KMDwMpUansgPVqb9KoE54',
    publicKey: '0x1af337073aac07c2622ba393854850341cff112d5d6380def23ee323b0d48802',
    version: 1,
  },
];

beforeEach(() => {
  mockHashicorpVault.fetchAllKeys.mockResolvedValue(
    accounts.map(({ name, publicKey, version }) => ({ name, publicKey, version }))
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('HashicorpVaultSigningManager Class', () => {
  let signingManager: HashicorpVaultSigningManager;

  beforeEach(async () => {
    signingManager = new HashicorpVaultSigningManager({
      url,
      token,
    });

    signingManager.setSs58Format(42);
  });

  describe('method: getAccounts', () => {
    it('should return all Accounts held in the Vault', async () => {
      const result = await signingManager.getAccounts();

      expect(result).toEqual(accounts.map(({ address }) => address));
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", () => {
      signingManager = new HashicorpVaultSigningManager({
        url,
        token,
      });

      return expect(signingManager.getAccounts()).rejects.toThrow(
        "Cannot call 'getAccounts' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: getExternalSigner', () => {
    it('should return a Vault Signer', () => {
      const signer = signingManager.getExternalSigner();
      expect(signer instanceof VaultSigner).toBe(true);
    });
  });

  describe('method: getVaultKeys', () => {
    it('should return the vault keys', async () => {
      const result = await signingManager.getVaultKeys();
      expect(result).toEqual(accounts);
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", () => {
      signingManager = new HashicorpVaultSigningManager({
        url,
        token,
      });
      return expect(signingManager.getVaultKeys()).rejects.toThrowError(
        "Cannot call 'getVaultKeys' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });
});

describe('class VaultSigner', () => {
  const expectedSignature = 'signature';

  let signer: VaultSigner;
  let registry: TypeRegistry;

  beforeEach(() => {
    registry = new TypeRegistry();
    signer = new VaultSigner(mockHashicorpVault as unknown as HashicorpVault, registry);
    mockHashicorpVault.signData.mockResolvedValue(expectedSignature);
  });

  describe('method signPayload', () => {
    it('should return a signed payload and an incremental ID', async () => {
      const payload = {
        specVersion: '0x00000bb9',
        transactionVersion: '0x00000002',
        address: accounts[0].address,
        blockHash: '0xdf06dca982acacbd5f0bcd7a8a062465b8441d569813561ed13ab81883bc08e7',
        blockNumber: '0x00000280',
        era: '0x0500',
        genesisHash: '0x44748824f9798715435c421b5db9af2beae537974d192fab5fb6fc12e1523765',
        method: '0x1a005041594c4f41445f54455354',
        nonce: '0x00000001',
        signedExtensions: [
          'CheckSpecVersion',
          'CheckTxVersion',
          'CheckGenesis',
          'CheckMortality',
          'CheckNonce',
          'CheckWeight',
          'ChargeTransactionPayment',
        ],
        tip: '0x00000000000000000000000000000000',
        version: 4,
      };

      let result = await signer.signPayload(payload);

      expect(result.id).toBe(0);
      expect(result.signature).toBe(expectedSignature);

      result = await signer.signPayload(payload);

      expect(result.id).toBe(1);
      expect(result.signature).toBe(expectedSignature);
    });

    it('should throw an error if the payload address is not present in the Vault', () => {
      mockHashicorpVault.fetchAllKeys.mockResolvedValue([]);
      return expect(
        signer.signPayload({
          address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        } as SignerPayloadJSON)
      ).rejects.toThrow('The signer cannot sign transactions on behalf of the calling Account');
    });
  });

  describe('method signRaw', () => {
    it('should return signed raw data and an incremental ID', async () => {
      const address = accounts[0].address;
      const data = u8aToHex(stringToU8a('Hello, my name is Alice'));
      const raw = {
        address,
        data,
        type: 'bytes' as const,
      };

      let result = await signer.signRaw(raw);

      expect(result.id).toBe(0);
      expect(result.signature).toBe(expectedSignature);

      result = await signer.signRaw(raw);

      expect(result.id).toBe(1);
      expect(result.signature).toBe(expectedSignature);
    });

    it('should throw an error if the payload address is not present in the Vault', () => {
      mockHashicorpVault.fetchAllKeys.mockResolvedValue([]);
      return expect(
        signer.signRaw({
          address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        } as SignerPayloadRaw)
      ).rejects.toThrow('The signer cannot sign transactions on behalf of the calling Account');
    });
  });
});
