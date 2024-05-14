import type { WalletConnectConfiguration } from '../lib/walletconnect';

export type UnsubCallback = () => void;

export interface CreateParams {
  config: WalletConnectConfiguration;
  appName: string;
  ss58Format?: number;
  genesisHash?: string;
}
