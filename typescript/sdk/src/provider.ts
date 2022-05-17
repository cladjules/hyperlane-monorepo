import { ethers } from 'ethers';

import { ChainMap, ChainName } from './types';
import { MultiGeneric } from './utils';

export interface IChainConnection {
  provider?: ethers.providers.Provider;
  signer?: ethers.Signer;
  overrides?: ethers.Overrides;
  confirmations?: number;
}

export class ChainConnection {
  provider?: ethers.providers.Provider;
  signer?: ethers.Signer;
  overrides: ethers.Overrides;
  confirmations: number;

  constructor(dc: IChainConnection = {}) {
    this.provider = dc.provider;
    this.signer = dc.signer;
    this.overrides = dc.overrides ?? {};
    this.confirmations = dc.confirmations ?? 0;
  }

  registerOverrides = (overrides: ethers.Overrides) =>
    (this.overrides = overrides);

  registerConfirmations = (confirmations: number) =>
    (this.confirmations = confirmations);

  registerProvider(provider: ethers.providers.Provider) {
    if (this.signer) {
      this.signer.connect(provider);
    }
    this.provider = provider;
  }

  registerRpcURL(url: string) {
    this.registerProvider(new ethers.providers.JsonRpcProvider(url));
  }

  registerSigner(signer: ethers.Signer) {
    if (this.provider) {
      signer.connect(this.provider);
    }
    this.signer = signer;
  }

  registerWalletSigner = (privatekey: string) =>
    this.registerSigner(new ethers.Wallet(privatekey));

  getConnection = () => this.signer ?? this.provider;

  getAddress = () => this.signer?.getAddress();
}

export class MultiProvider<
  Networks extends ChainName = ChainName,
> extends MultiGeneric<Networks, ChainConnection> {
  constructor(networks: ChainMap<Networks, IChainConnection> | Networks[]) {
    const params = Array.isArray(networks)
      ? networks.map((v) => [v, {}])
      : (Object.entries(networks) as [Networks, IChainConnection][]);
    const providerEntries = params.map(([network, v]) => [
      network,
      new ChainConnection(v),
    ]);
    super(Object.fromEntries(providerEntries));
  }
  getChainConnection(network: Networks) {
    return this.get(network);
  }
  // This doesn't work on hardhat providers so we skip for now
  // ready() {
  //   return Promise.all(this.values().map((dc) => dc.provider!.ready));
  // }
}
