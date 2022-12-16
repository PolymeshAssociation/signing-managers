import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { stringToU8a, u8aToHex } from '@polkadot/util';

import { FireblocksSigner, FireblocksSigningManager } from './fireblocks-signing-manager';
import { Fireblocks } from './fireblocks/fireblocks';
import { mockHashicorpVault } from './fireblocks/mocks';
import { KeyInfo } from './fireblocks/types';

jest.mock('fs');

const algorithm = 'MPC_EDDSA_ED25519';

const accounts: KeyInfo[] = [
  {
    address: '5C61uSppDAB6oYmD4UQw1mcjftLsH8BbdnLiekCtnjHy2ZDH',
    publicKey: '0100000000000000000000000000000000000000000000000000000000000000',
    derivationPath: [44, 1, 0, 0, 0],
    status: 0,
    algorithm,
  },
  {
    address: '5C7KxDuhH6cg3dXw5assAh4dCPgPFYvLM4QvTnQ98YcTEV3G',
    publicKey: '0200000000000000000000000000000000000000000000000000000000000000',
    derivationPath: [44, 1, 2, 0, 0],
    status: 0,
    algorithm,
  },
  {
    address: '5C8dzzzaM34FHiJf6hLoKcWWiu1uDyf54LV8GpbPUMvwSR1V',
    publicKey: '0300000000000000000000000000000000000000000000000000000000000000',
    derivationPath: [44, 1, 2, 0, 0],
    status: 0,
    algorithm,
  },
];

const url = 'http://example.com';
const token = 'API-KEY';
const secretPath = './secret.key';

describe('ApprovalSigningManager Class', () => {
  let signingManager: FireblocksSigningManager;

  beforeEach(async () => {
    signingManager = new FireblocksSigningManager({
      url: 'http://example.com',
      token: 'API-KEY',
      secretPath: './secret.key',
    });

    signingManager.setSs58Format(42);
  });

  describe('method: getAccounts', () => {
    it('should return all accessible Accounts held', async () => {
      const getKeysSpy = jest.spyOn(signingManager.fireblocks, 'fetchAllKeys');
      getKeysSpy.mockResolvedValue(accounts);

      const result = await signingManager.getAccounts();

      expect(result).toEqual(accounts.map(({ address }) => address));
    });
  });

  describe('method: getExternalSigner', () => {
    it('should return an FireblocksSigner', () => {
      const signer = signingManager.getExternalSigner();
      expect(signer).toBeInstanceOf(FireblocksSigner);
    });
  });

  describe('class FireblocksSigner', () => {
    const expectedSignature = 'signature';

    let signer: FireblocksSigner;
    let registry: TypeRegistry;
    let fireblocks: Fireblocks;

    beforeEach(() => {
      fireblocks = new Fireblocks(url, token, secretPath);
      registry = new TypeRegistry();
      signer = new FireblocksSigner(fireblocks, registry);
    });

    describe('method signPayload', () => {
      it('should return a signed payload and an incremental ID', async () => {
        const payload = {
          specVersion: '0x00000bba',
          transactionVersion: '0x00000002',
          address: accounts[0].address,
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

        const expectedSignature = '0x000100000';

        const lookupAddressSpy = jest.spyOn(fireblocks, 'lookupAddress');
        lookupAddressSpy.mockReturnValue(accounts[0]);

        const signDataSpy = jest.spyOn(fireblocks, 'signData');
        signDataSpy.mockResolvedValue(expectedSignature);

        let { id, signature } = await signer.signPayload(payload);

        expect(id).toBe(0);
        expect(signature).toBe(expectedSignature);

        ({ id, signature } = await signer.signPayload(payload));

        expect(id).toBe(1);
        expect(signature).toBe(expectedSignature);

        lookupAddressSpy.mockRestore();
        signDataSpy.mockRestore();
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
      it('should return signed raw data and an incremental ID', async () => {
        const address = accounts[0].address;
        const data = u8aToHex(stringToU8a('Hello, my name is Alice'));
        const raw = {
          address,
          data,
          type: 'bytes' as const,
        };

        const expectedSignature = '0x00123';

        const lookupAddressSpy = jest.spyOn(fireblocks, 'lookupAddress');
        lookupAddressSpy.mockReturnValue(accounts[0]);

        const signDataSpy = jest.spyOn(fireblocks, 'signData');
        signDataSpy.mockResolvedValue(expectedSignature);

        let { id, signature } = await signer.signRaw(raw);

        expect(id).toBe(0);
        expect(signature).toBe(expectedSignature);

        // ({ id, signature } = await signer.signRaw(raw));

        // expect(id).toBe(1);
        // expect(signature).toBe(expectedSignature);

        // lookupAddressSpy.mockRestore();
        // signDataSpy.mockRestore();
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
