import type { InjectedExtension } from '@polkadot/extension-inject/types';

export type UnsubCallback = () => void;

export enum NetworkName {
  mainnet = 'mainnet',
  testnet = 'testnet',
  staging = 'staging',
  local = 'local',
}

export interface NetworkInfo {
  name: NetworkName;
  label: string;
  wssUrl: string;
}

// The type of `InjectedExtension` does not include the polywallet specific `network` and `uid` properties.
export type Extension = InjectedExtension & {
  network: {
    subscribe(cb: (networkInfo: NetworkInfo) => void): UnsubCallback;
    get(): Promise<NetworkInfo>;
  };
  uid: {
    isSet(): Promise<boolean>;
    provide(payload: { did: string; uid: string; network: NetworkName }): Promise<boolean>;
    read(): Promise<{ id: number; uid: string }>;
    requestProof(payload: { ticker: string }): Promise<{ id: number; proof: string }>;
  };
};
