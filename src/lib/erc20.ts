import { BigNumber } from 'ethers';
import EvmAddress from './evmAddress';

export type ERC20 = {
  address: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
};
