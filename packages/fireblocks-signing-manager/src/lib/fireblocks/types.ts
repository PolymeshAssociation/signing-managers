/* eslint-disable @typescript-eslint/naming-convention */

import { PublicKeyResonse } from 'fireblocks-sdk';

/**
 * A derivation path consists of 5 numbers [Purpose, Coin Type, Account ID, Change, Address Index]
 *
 * - Purpose - Should be `44` to indicate the strategy [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
 * - Coin Type - For POLYX this Should be `1` for non mainnet, and `595` for mainnet. See [this list](https://github.com/satoshilabs/slips/blob/2a2f4c79508749f7e679a127d5a56da079b8d2d8/slip-0044.md)
 * - Account ID - This should be set to the Vault Account ID in the fireblocks platform.
 * - Change - Should be set to 0. Can be used with Address Index to create nested sub accounts
 * - Address Index - Should be set to 0. Can be used to create sub account if desired
 *
 * Example: [44, 1, id, 0, subId] // accepts 2 parameters from the user
 */
export type DerivationPath = [44, 1 | 595, number, number, number];

export interface KeyInfo extends PublicKeyResonse {
  address: string;
}
