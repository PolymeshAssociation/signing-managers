import { Response } from 'cross-fetch';

export class MockHashicorpVault {
  public fetchAllKeys = jest.fn();

  public fetchKeysByName = jest.fn();

  public signData = jest.fn();
}

export const mockHashicorpVault = new MockHashicorpVault();

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
