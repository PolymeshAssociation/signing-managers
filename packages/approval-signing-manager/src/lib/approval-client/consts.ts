/**
 * A common prefix for all routes
 */
export const routePrefix = 'v1/client';

/**
 * The path to the signature collection
 */
export const signatureRoute = 'polymesh/signature';

/**
 * The path to create a wallet
 */
export const createWalletRoute = 'wallets/create';

/**
 * The path to fetch a clients available wallets. Expected to be appended with the clientId
 */
export const getWalletRoute = 'wallets';

/**
 * The API returns key information for other networks. This is used to filter for polymesh specific values
 */
export const meshNetwork = 'polymesh';
