import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { stringToU8a, u8aToHex } from '@polkadot/util';
import { encodeAddress } from '@polkadot/util-crypto';
import { PublicKeyResonse } from 'fireblocks-sdk';

import { maxInitialDerivedAccounts } from './fireblocks/consts';
import { Fireblocks } from './fireblocks/fireblocks';
import { ConfigError, DerivationPath } from './fireblocks/types';
import { FireblocksSigner, FireblocksSigningManager } from './fireblocks-signing-manager';

jest.mock('fs');

const algorithm = 'MPC_EDDSA_ED25519';

const fireblocksKeys: PublicKeyResonse[] = [
  {
    publicKey: '0100000000000000000000000000000000000000000000000000000000000000',
    derivationPath: [44, 1, 0, 0, 0],
    status: 0,
    algorithm,
  },
  {
    publicKey: '0200000000000000000000000000000000000000000000000000000000000000',
    derivationPath: [44, 1, 2, 0, 0],
    status: 0,
    algorithm,
  },
  {
    publicKey: '0300000000000000000000000000000000000000000000000000000000000000',
    derivationPath: [44, 1, 2, 0, 0],
    status: 0,
    algorithm,
  },
];

const url = 'http://example.com';
const apiKey = 'API-KEY';
const secretPath = './secret.key';
const ss58Format = 42;

describe('FireblocksSigningManager Class', () => {
  let signingManager: FireblocksSigningManager;

  beforeEach(async () => {
    signingManager = await FireblocksSigningManager.create({
      url,
      apiKey,
      secretPath,
      derivationPaths: [],
    });

    signingManager.setSs58Format(42);
  });

  describe('method: create', () => {
    it('should return an instance of the FireblocksSigningManager class', async () => {
      const manager = await FireblocksSigningManager.create({
        url,
        apiKey,
        secretPath,
        derivationPaths: [],
      });

      expect(manager).toBeInstanceOf(FireblocksSigningManager);
    });

    it('should error if given a large number of initial accounts', async () => {
      const derivationPaths: DerivationPath[] = [...new Array(maxInitialDerivedAccounts + 1)].map(
        (v, index) => [44, 1, index, 0, 0]
      );

      const expectedError = new ConfigError(
        'Number of initial derivation paths cannot exceed 120. Use deriveAccount after creation to load more accounts instead'
      );

      return expect(
        FireblocksSigningManager.create({
          url,
          apiKey,
          secretPath,
          derivationPaths,
        })
      ).rejects.toThrow(expectedError);
    });
  });

  describe('method: getAccounts', () => {
    it('should return all derived Accounts', async () => {
      jest
        .spyOn(signingManager.fireblocksClient, 'fetchDerivedKeys')
        .mockReturnValue(fireblocksKeys);

      const result = await signingManager.getAccounts();

      expect(result).toEqual(
        fireblocksKeys.map(({ publicKey }) => encodeAddress(`0x${publicKey}`, ss58Format))
      );
    });

    it('should throw an error if ss58Format is not defined', () => {
      signingManager.setSs58Format(undefined as unknown as number);

      const expectedError = new ConfigError(
        'FireblocksSigningManager ss58Format was not set. The Polymesh SDK should set the format upon its initialization'
      );

      return expect(signingManager.getAccounts()).rejects.toThrowError(expectedError);
    });
  });

  describe('method: getExternalSigner', () => {
    it('should return a FireblocksSigner', () => {
      const signer = signingManager.getExternalSigner();
      expect(signer).toBeInstanceOf(FireblocksSigner);
    });
  });

  describe('class FireblocksSigner', () => {
    let signer: FireblocksSigner;
    let registry: TypeRegistry;
    let fireblocks: Fireblocks;

    beforeEach(() => {
      fireblocks = new Fireblocks({ url, apiKey, secretPath });
      registry = new TypeRegistry();
      signer = new FireblocksSigner(fireblocks, registry);
    });

    describe('method signPayload', () => {
      it('should return a signed payload and an incremental ID', async () => {
        const payload = {
          specVersion: '0x00000bba',
          transactionVersion: '0x00000002',
          address: encodeAddress(`0x${fireblocksKeys[0].publicKey}`, ss58Format),
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

        const rawSignature = '0100000';
        const expectedSignature = '0x000100000';

        jest.spyOn(fireblocks, 'lookupKey').mockReturnValue(fireblocksKeys[0]);

        jest.spyOn(fireblocks, 'signData').mockResolvedValue(rawSignature);

        let { id, signature } = await signer.signPayload(payload);

        expect(id).toBe(0);
        expect(signature).toBe(expectedSignature);

        ({ id, signature } = await signer.signPayload(payload));

        expect(id).toBe(1);
        expect(signature).toBe(expectedSignature);
      });

      it('should throw an error if the payload address is not present in the backing API', () => {
        return expect(
          signer.signPayload({
            address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
          } as SignerPayloadJSON)
        ).rejects.toThrow('The signer cannot sign transactions on behalf of the calling Account');
      });
    });

    describe('method signRaw', () => {
      const rawSignature = '123';
      const expectedSignature = '0x00123';

      it('should return signed raw data and an incremental ID', async () => {
        const address = encodeAddress(`0x${fireblocksKeys[0].publicKey}`, ss58Format);
        const data = u8aToHex(stringToU8a('Hello, my name is Alice'));
        const raw = {
          address,
          data,
          type: 'bytes' as const,
        };

        jest.spyOn(fireblocks, 'lookupKey').mockReturnValue(fireblocksKeys[0]);

        jest.spyOn(fireblocks, 'signData').mockResolvedValue(rawSignature);

        const { id, signature } = await signer.signRaw(raw);

        expect(id).toBe(0);
        expect(signature).toBe(expectedSignature);
      });

      it('should hash payloads larger than 256 bytes', async () => {
        const address = encodeAddress(`0x${fireblocksKeys[0].publicKey}`, ss58Format);
        const inputData = stringToU8a(''.padEnd(257, 'A'));
        const data = u8aToHex(inputData);
        const raw = {
          address,
          data,
          type: 'bytes' as const,
        };

        jest.spyOn(fireblocks, 'lookupKey').mockReturnValue(fireblocksKeys[0]);

        jest.spyOn(fireblocks, 'signData').mockResolvedValue(rawSignature);

        await signer.signRaw(raw);

        const expectedData = '68b9f4466b19c20b2ff001f34ba6baaaf31b10057b18f3f4eb9232b990df186e';
        const expectedNote =
          'https://testnet-app.polymesh.live/#/extrinsics/decode/0x4141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141414141';

        expect(fireblocks.signData).toHaveBeenCalledWith(
          fireblocksKeys[0].derivationPath,
          expectedData,
          expectedNote
        );
      });

      it('should not hash payloads smaller than 256 bytes', async () => {
        const address = encodeAddress(`0x${fireblocksKeys[0].publicKey}`, ss58Format);
        const inputData = stringToU8a('AAA');
        const data = u8aToHex(inputData);
        const raw = {
          address,
          data,
          type: 'bytes' as const,
        };

        jest.spyOn(fireblocks, 'lookupKey').mockReturnValue(fireblocksKeys[0]);

        jest.spyOn(fireblocks, 'signData').mockResolvedValue(rawSignature);

        await signer.signRaw(raw);

        const expectedBody = '414141';
        const expectedNote = 'https://testnet-app.polymesh.live/#/extrinsics/decode/0x414141';

        expect(fireblocks.signData).toHaveBeenCalledWith(
          fireblocksKeys[0].derivationPath,
          expectedBody,
          expectedNote
        );
      });

      it('should throw an error if the payload address is not present in the backing API', () => {
        return expect(
          signer.signRaw({
            address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
          } as SignerPayloadRaw)
        ).rejects.toThrow('The signer cannot sign transactions on behalf of the calling Account');
      });
    });
  });
});
