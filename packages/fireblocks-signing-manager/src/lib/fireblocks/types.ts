/* eslint-disable @typescript-eslint/naming-convention */

import { PublicKeyResonse } from 'fireblocks-sdk';

export interface GetKeyResponse extends PublicKeyResonse {
  address: string;
}
