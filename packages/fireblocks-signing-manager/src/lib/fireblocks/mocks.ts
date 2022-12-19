export class MockFireblocks {
  public fetchDerivedKeys = jest.fn();

  public signData = jest.fn();

  public lookupKey = jest.fn();
}

export const mockFireblocks = new MockFireblocks();
