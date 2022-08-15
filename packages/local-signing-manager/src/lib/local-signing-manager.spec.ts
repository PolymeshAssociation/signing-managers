import { Keyring } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { hexToU8a, stringToU8a, u8aToHex } from '@polkadot/util';
import { cryptoWaitReady, mnemonicGenerate, signatureVerify } from '@polkadot/util-crypto';

import { PrivateKey } from '../types';
import { KeyringSigner, LocalSigningManager } from './local-signing-manager';

jest.mock('@polkadot/util-crypto', () => ({
  ...jest.requireActual('@polkadot/util-crypto'),
  mnemonicGenerate: jest.fn(),
}));

describe('LocalSigningManager Class', () => {
  let signingManager: LocalSigningManager;
  let accounts: { privateKey: PrivateKey; address: string; publicKey: Uint8Array }[];
  const mnemonicGenerateStub = mnemonicGenerate as jest.MockedFunction<typeof mnemonicGenerate>;

  beforeAll(() => {
    accounts = [
      {
        privateKey: {
          seed: '0x93a2c0c831f0f7c722285daf8522df4799727dffad4ee6669b57d9a6c45b69b6',
        },
        address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        publicKey: hexToU8a('0x72a5a53f6a04459a8e8ed266cc048db7f8c8d3faac0204f99ed593400bad636c'),
      },
      {
        privateKey: {
          uri: 'zone earth dad evidence club text roast claim decorate satoshi dress seven//test',
        },
        address: '5HQLVKFYkytr9HisQRWoUArUWw8YNWUmhLdXztRFjqysiNUx',
        publicKey: hexToU8a('0xec2624ca769be5bc57cd23f0f1d8c06a0f68ac06a57e00355361d45000af7c28'),
      },
      {
        privateKey: {
          mnemonic: 'bachelor nurse busy spot cannon equal drip outer autumn fork virtual thunder',
        },
        address: '5Cg3MNhhuPD5UUjXjjKNszzXic5KMDwMpUansgPVqb9KoE54',
        publicKey: hexToU8a('0x1af337073aac07c2622ba393854850341cff112d5d6380def23ee323b0d48802'),
      },
    ];
  });

  beforeEach(async () => {
    signingManager = await LocalSigningManager.create({
      accounts: accounts.map(({ privateKey }) => privateKey),
    });

    signingManager.setSs58Format(42);
  });

  describe('method: getAccounts', () => {
    it('should return all Accounts held in the keyring', async () => {
      const result = await signingManager.getAccounts();

      expect(result).toEqual(accounts.map(({ address }) => address));
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      signingManager = await LocalSigningManager.create({
        accounts: accounts.map(({ privateKey }) => privateKey),
      });

      expect(signingManager.getAccounts()).rejects.toThrow(
        "Cannot call 'getAccounts' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: getExternalSigner', () => {
    it('should return a Keyring Signer', () => {
      const signer = signingManager.getExternalSigner();
      expect(signer instanceof KeyringSigner).toBe(true);
    });
  });

  describe('method: addAccount', () => {
    it('should add a new Account and return its address', () => {
      const result = signingManager.addAccount({
        seed: '0xb5da7610352f87452fe5fa4d9af35a3fbb613e7afee2c72056333db0b94d6f98',
      });

      expect(result).toBe('5FcF7cEA4e3yg8FJmu6UZZeh96dEV5AF84cih4WV9bhKsWjw');
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", async () => {
      signingManager = await LocalSigningManager.create({
        accounts: accounts.map(({ privateKey }) => privateKey),
      });

      expect(() =>
        signingManager.addAccount({
          seed: '0xb5da7610352f87452fe5fa4d9af35a3fbb613e7afee2c72056333db0b94d6f98',
        })
      ).toThrow(
        "Cannot call 'addAccount' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: generateAccount', () => {
    it('should generate a new Account and return its mnemonic', () => {
      const mockMnemonic =
        'risk topple twice merry intact slot plunge jeans penalty consider secret owner';

      mnemonicGenerateStub.mockReturnValue(mockMnemonic);
      const mnemonic = LocalSigningManager.generateAccount();

      expect(mnemonic).toBe(mockMnemonic);
    });
  });
});

describe('class KeyringSigner', () => {
  let keyring: Keyring;
  let signer: KeyringSigner;
  let address: string;
  let registry: TypeRegistry;

  beforeAll(async () => {
    await cryptoWaitReady();
    keyring = new Keyring({
      type: 'sr25519',
    });
    ({ address } = keyring.addFromUri('//Alice'));
  });

  beforeEach(() => {
    registry = new TypeRegistry();
    signer = new KeyringSigner(keyring, registry);
  });

  describe('method signPayload', () => {
    it('should return a signed payload and an incremental ID', async () => {
      const payload = {
        specVersion: '0x00000bb9',
        transactionVersion: '0x00000002',
        address,
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
      /*
       * I had to go to hell and back to get this value, but trust me, it's a raw version of the above payload.
       * In order to re-generate both, you must:
       *   - create a script that uses the Polymesh SDK with a signing manager to reserve a ticker (or any other simple extrinsic)
       *   - open `node_modules/@polkadot/api/submittable/createClass.js` (it might be createClass.cjs. Do both to be sure)
       *   - go to the definition of `_signViaSigner`, log both `payload.toJson()` and `payload.toRaw()`
       *   - run the script and pick the values from the terminal
       * Since sr25519 signatures are non-deterministic, the only way to verify that stuff is signed properly is via `signatureVerify`,
       * Which only handles raw data
       */
      const rawPayload =
        '0x1a005041594c4f41445f5445535405000400b90b00000200000044748824f9798715435c421b5db9af2beae537974d192fab5fb6fc12e1523765df06dca982acacbd5f0bcd7a8a062465b8441d569813561ed13ab81883bc08e7';

      let result = await signer.signPayload(payload);

      expect(result.id).toBe(0);
      expect(signatureVerify(rawPayload, result.signature, address).isValid).toBe(true);

      result = await signer.signPayload(payload);

      expect(result.id).toBe(1);
      expect(signatureVerify(rawPayload, result.signature, address).isValid).toBe(true);
    });

    it('should throw an error if the payload address is not present in the keyring', () => {
      return expect(
        signer.signPayload({
          address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        } as SignerPayloadJSON)
      ).rejects.toThrow('The signer cannot sign transactions on behalf of the calling Account');
    });

    it('should throw any errors thrown by the keyring', () => {
      return expect(
        signer.signPayload({
          address: 'whatever',
        } as SignerPayloadJSON)
      ).rejects.toThrow();
    });
  });

  describe('method signRaw', () => {
    it('should return signed raw data and an incremental ID', async () => {
      const data = u8aToHex(stringToU8a('Hello, my name is Alice'));
      const raw = {
        address,
        data,
        type: 'bytes' as const,
      };

      let result = await signer.signRaw(raw);

      expect(result.id).toBe(0);
      expect(signatureVerify(data, result.signature, address).isValid).toBe(true);

      result = await signer.signRaw(raw);

      expect(result.id).toBe(1);
      expect(signatureVerify(data, result.signature, address).isValid).toBe(true);
    });

    it('should throw an error if the payload address is not present in the keyring', () => {
      return expect(
        signer.signRaw({
          address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
        } as SignerPayloadRaw)
      ).rejects.toThrow('The signer cannot sign transactions on behalf of the calling Account');
    });

    it('should throw any errors thrown by the keyring', () => {
      return expect(
        signer.signRaw({
          address: 'whatever',
        } as SignerPayloadRaw)
      ).rejects.toThrow();
    });
  });
});
