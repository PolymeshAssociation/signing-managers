import { web3Enable } from '@polkadot/extension-dapp';
import { PolkadotSigner } from '@polymeshassociation/signing-manager-types';

export type UnsubCallback = () => void;

export interface NetworkInfo {
  name: string;
  label: string;
  wssUrl: string;
}

// the return value of `web3Enable` isn't properly typed. It should have a `network` property
export type Extension = Awaited<ReturnType<typeof web3Enable>>[number] & {
  network?: {
    subscribe(cb: (networkInfo: NetworkInfo) => void): UnsubCallback;
    get(): Promise<NetworkInfo>;
  };
  signer: PolkadotSigner;
};
