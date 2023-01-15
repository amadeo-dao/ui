import vaultAbi from './vault.abi.json';
import { BigNumber, ethers } from 'ethers';
import { provider } from './providers';
import { ERC20, loadERC20 } from './erc20';
import EvmAddress from './evmAddress';

export type Vault = {
  address: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: BigNumber;
  asset: {
    address: EvmAddress;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: BigNumber;
  };
  sharePrice: BigNumber;
  assetsUnderManagement: BigNumber;
  assetsInUse: BigNumber;
};

export type VaultDefaults = ERC20 & {
  asset: ERC20;
  sharePrice: string;
  assetsUnderManagement: string;
  assetsInUse: string;
};

let vault: VaultDefaults | undefined;

export async function loadVault(vaultAddress: string): Promise<VaultDefaults> {
  if (!vaultAddress) throw new Error('VAULT environment variable not set');
  if (!vaultAddress.startsWith('0x')) throw new Error('VAULT environment variable is not an EVM address');
  const contract = new ethers.Contract(vaultAddress, vaultAbi, provider);
  const { symbol, name, decimals, totalSupply } = await loadERC20(vaultAddress as EvmAddress);
  const sharePrice = await contract.convertToAssets(BigNumber.from(10).pow('' + decimals ?? 18));
  const assetAddress = await contract.asset();
  const asset = await loadERC20(assetAddress);
  const assetsUnderManagement = await contract.totalAssets();
  const assetsInUse = await contract.assetsInUse();
  return {
    address: vaultAddress as EvmAddress,
    name,
    symbol,
    decimals,
    totalSupply: totalSupply.toString(),
    asset,
    sharePrice: sharePrice.toString(),
    assetsUnderManagement: assetsUnderManagement.toString(),
    assetsInUse: assetsInUse.toString()
  };
}
