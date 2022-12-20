import { DerivationPath } from './types';

/**
 * @note Fireblocks API has a rate limit of ~180 GET per second. Rate limiting should be implemented before removing this limitation as each path creates a request
 */
export const maxInitialDerivedAccounts = 120;

export const defaultKeyPath: DerivationPath = [44, 1, 0, 0, 0];
