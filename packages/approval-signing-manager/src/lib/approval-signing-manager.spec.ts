import { TypeRegistry } from '@polkadot/types';
import { SignerPayloadJSON, SignerPayloadRaw } from '@polkadot/types/types';
import { stringToU8a, u8aToHex } from '@polkadot/util';

import { ApprovalClient } from './approval-client/approval-client';
import { mockApprovalClient } from './approval-client/mocks';
import { ApprovalSigner, ApprovalSigningManager } from './approval-signing-manager';

jest.mock('./approval-client', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ApprovalClient: function () {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('./approval-client/mocks').mockApprovalClient;
  },
}));

const url = 'http://example.com';
const apiKey = 'someAuthToken';
const apiClientId = 'someId';

const accounts = [
  {
    address: '5Ef2XHepJvTUJLhhx39Nf5iqu6AACrfFAmc6AW8a3hKF4Rdc',
    token: 'polyx',
    network: 'polymesh',
    _id: '1',
    ownerId: 'alice',
  },
  {
    address: '5HQLVKFYkytr9HisQRWoUArUWw8YNWUmhLdXztRFjqysiNUx',
    token: 'polyx',
    network: 'polyx',
    _id: '2',
    ownerId: 'alice',
  },
  {
    address: '5Cg3MNhhuPD5UUjXjjKNszzXic5KMDwMpUansgPVqb9KoE54',
    token: 'polyx',
    network: 'polyx',
    _id: '2',
    ownerId: 'alice',
  },
];

beforeEach(() => {
  mockApprovalClient.fetchKeys.mockResolvedValue(accounts);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('ApprovalSigningManager Class', () => {
  let signingManager: ApprovalSigningManager;

  beforeEach(async () => {
    signingManager = getSigningManager();

    signingManager.setSs58Format(42);
  });

  describe('method: getAccounts', () => {
    it('should return all accessible Accounts held', async () => {
      const result = await signingManager.getAccounts();

      expect(result).toEqual(accounts.map(({ address }) => address));
    });

    it("should throw an error if the Signing Manager doesn't have a SS58 format", () => {
      signingManager = new ApprovalSigningManager({ url, apiClientId, apiKey });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (signingManager as any).approvalClient = mockApprovalClient;

      return expect(signingManager.getAccounts()).rejects.toThrow(
        "Cannot call 'getAccounts' before calling 'setSs58Format'. Did you forget to use this Signing Manager to connect with the Polymesh SDK?"
      );
    });
  });

  describe('method: getExternalSigner', () => {
    it('should return an Approval Signer', () => {
      const signer = signingManager.getExternalSigner();
      expect(signer).toBeInstanceOf(ApprovalSigner);
    });
  });

  describe('class ApprovalSigner', () => {
    const expectedSignature = 'signature';

    let signer: ApprovalSigner;
    let registry: TypeRegistry;

    beforeEach(() => {
      registry = new TypeRegistry();
      signer = new ApprovalSigner(mockApprovalClient as unknown as ApprovalClient, registry);
      mockApprovalClient.signData.mockResolvedValue(expectedSignature);
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

        let { id, signature } = await signer.signPayload(payload);

        expect(id).toBe(0);
        expect(signature).toBe(expectedSignature);

        ({ id, signature } = await signer.signPayload(payload));

        expect(id).toBe(1);
        expect(signature).toBe(expectedSignature);
      });

      it('should throw an error if the payload address is not present in the backing API', () => {
        mockApprovalClient.fetchKeys.mockResolvedValue([]);
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

        let { id, signature } = await signer.signRaw(raw);

        expect(id).toBe(0);
        expect(signature).toBe(expectedSignature);

        ({ id, signature } = await signer.signRaw(raw));

        expect(id).toBe(1);
        expect(signature).toBe(expectedSignature);
      });

      it('should throw an error if the payload address is not present in the backing API', () => {
        mockApprovalClient.fetchKeys.mockResolvedValue([]);
        return expect(
          signer.signRaw({
            address: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
          } as SignerPayloadRaw)
        ).rejects.toThrow('The signer cannot sign transactions on behalf of the calling Account');
      });
    });
  });
});

const getSigningManager = (): ApprovalSigningManager => {
  const signingManager = new ApprovalSigningManager({ url, apiClientId, apiKey });
  // work around as ApprovalSigningManager isn't creating the client as the mock version for some reason
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (signingManager as any).approvalClient = mockApprovalClient;

  return signingManager;
};
