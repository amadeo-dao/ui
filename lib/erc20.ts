import { ethers } from 'ethers';
import { erc20ABI } from 'wagmi';
import EvmAddress from './evmAddress';
import { provider } from './providers';

export type ERC20 = {
  address: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
};

export async function loadERC20(address: EvmAddress): Promise<ERC20> {
  let contract = new ethers.Contract(address, erc20ABI, provider);
  return {
    address,
    name: await contract.name(),
    symbol: await contract.symbol(),
    decimals: await contract.decimals(),
    totalSupply: (await contract.totalSupply()).toString()
  };
}
