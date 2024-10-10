import { PagedAsyncIterableIterator, PageSettings } from '@azure/keyvault-keys';
import { blake2AsU8a } from '@polkadot/util-crypto';

const compressPublicKey = (publicKeyBuffer: Uint8Array): Uint8Array => {
  // Ensure the input is a 65-byte uncompressed key starting with 0x04
  if (publicKeyBuffer.length !== 65 || publicKeyBuffer[0] !== 0x04) {
    throw new Error('Invalid uncompressed public key format');
  }

  // Extract x and y coordinates
  const x = publicKeyBuffer.slice(1, 33); // First 32 bytes after 0x04
  const y = publicKeyBuffer.slice(33, 65); // Next 32 bytes after x

  // Determine whether y is even or odd
  const isEvenY = (y[31] & 1) === 0; // Check the least significant bit of y

  // Compressed public key starts with 0x02 if y is even, 0x03 if odd
  const prefix = isEvenY ? 0x02 : 0x03;

  // Create the compressed public key by concatenating the prefix with the x coordinate
  const compressedPublicKey = new Uint8Array(33);
  compressedPublicKey[0] = prefix;
  compressedPublicKey.set(x, 1); // Copy the x coordinate starting at position 1

  return compressedPublicKey;
};

export const createPagedAsyncIterableIterator = <T>(
  items: T[]
): PagedAsyncIterableIterator<T, T[], PageSettings> => {
  const pagedResults: T[] = items;
  return {
    async next() {
      const value = pagedResults.shift();
      return { value, done: value === undefined };
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  } as PagedAsyncIterableIterator<T, T[], PageSettings>;
};

export const bufferToCompressedKey = (key: Uint8Array): Buffer => {
  const publicCompressedKey = compressPublicKey(key);
  const publicAccountId = blake2AsU8a(publicCompressedKey);

  return Buffer.from(publicAccountId);
};
