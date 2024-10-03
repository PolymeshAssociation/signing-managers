import { DefaultAzureCredential } from '@azure/identity';

import { AzureKey } from '../lib/azure-hsm';

export interface AddressedAzureKey extends AzureKey {
  /**
   * ss58 encoded version of the publicKey
   */
  address: string;
}

/**
 * Arguments required to construct an Azure Signing Manager
 */
export interface AzureSigningManagerArgs {
  /**
   * The key vault URL where the keys are stored
   */
  keyVaultUrl: string;
  /**
   * @optional The Azure credential object. If not provided `new DefaultAzureCredential()` will be used. More information can be found in Microsoft's documentation: https://learn.microsoft.com/en-us/javascript/api/@azure/identity/defaultazurecredential?view=azure-node-latest
   */
  credential?: DefaultAzureCredential;
}
