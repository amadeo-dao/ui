import vaultAbi from './vault.abi.json';
import { BigNumber, ethers } from 'ethers';
import { provider } from './providers';
import { ERC20, loadERC20 } from './erc20';
import EvmAddress from './evmAddress';

export type Vault = ERC20 & {
  asset: ERC20;
  sharePrice: string;
  assetsUnderManagement: string;
};

let vault: Vault | undefined;

export async function loadVault(): Promise<Vault> {
  const address = process.env.VAULT;
  if (!address) throw new Error('VAULT environment variable not set');
  if (!address.startsWith('0x'))
    throw new Error('VAULT environment variable is not an EVM address');
  if (!vault) {
    const contract = new ethers.Contract(address, vaultAbi, provider);
    const { symbol, name, decimals, totalSupply } = await loadERC20(
      address as EvmAddress
    );
    const sharePrice = await contract.convertToAssets(
      BigNumber.from(10).pow('' + decimals ?? 18)
    );
    const assetAddress = await contract.asset();
    const asset = await loadERC20(assetAddress);
    const assetsUnderManagement = BigNumber.from(totalSupply)
      .mul(sharePrice)
      .div(BigNumber.from(10).pow(decimals + ''));
    vault = {
      address: address as EvmAddress,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      asset,
      sharePrice: sharePrice.toString(),
      assetsUnderManagement: assetsUnderManagement.toString()
    };
  }
  return vault;
}
