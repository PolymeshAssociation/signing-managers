import { Headers } from './types';

export class MockApprovalClient {
  public fetchKeys = jest.fn();

  public fetchOwnerKeys = jest.fn();

  public signData = jest.fn();

  public url = 'http://example.com';

  public apiClientId = 'mockClientId';

  public getUrl = jest.fn();

  public getSignature = jest.fn();

  public createWallet = jest.fn();

  private headers: Headers = {
    Authorization: 'mockApiKey',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Content-Type': 'application/json',
  };

  private readBody = jest.fn();
}

export const mockApprovalClient = new MockApprovalClient();

export function createMockResponse(
  status: number,
  statusText: string,
  response: unknown
): Response {
  return {
    status,
    statusText,
    json: async () => response,
  } as Response;
}
