import { createContext, useContext, useState } from 'react';
import { Vault, VaultDefaults } from '../vault';

import vaultAbiJson from '../../lib/vault.abi.json';
import { useContractRead } from 'wagmi';
import { BigNumber } from 'ethers';
import { BN_1E } from '../constants';

export const vaultABI = vaultAbiJson;

const defaultVault: VaultDefaults = {
  address: '0x0',
  asset: {
    address: '0x0',
    symbol: '',
    name: '',
    decimals: 18,
    totalSupply: '0'
  },
  symbol: '',
  name: '',
  decimals: 18,
  totalSupply: '0',
  sharePrice: '0',
  assetsUnderManagement: '0'
};

export type UseVaultReturnType = {
  vault: Vault;
  refetch: () => void;
  refetchAUM: () => void;
  refetchSharePrice: () => void;
  refetchTotalSupply: () => void;
};

export function useVault(): UseVaultReturnType {
  const vaultDefaults = useContext(VaultDefaultsContext);
  const [totalSupply, setTotalSupply] = useState(BigNumber.from(vaultDefaults.totalSupply));
  const [aum, setAUM] = useState(BigNumber.from(vaultDefaults.assetsUnderManagement));
  const [sharePrice, setSharePrice] = useState(BigNumber.from(vaultDefaults.sharePrice));

  const { refetch: refetchTotalSupply } = useContractRead({
    address: vaultDefaults.address,
    abi: vaultABI,
    functionName: 'totalSupply',
    enabled: false,
    onSuccess(data: BigNumber) {
      setTotalSupply(data);
    }
  });

  const { refetch: refetchAUM } = useContractRead({
    address: vaultDefaults.address,
    abi: vaultABI,
    functionName: 'totalAssets',
    enabled: false,
    onSuccess(data: BigNumber) {
      setAUM(data);
    }
  });

  const { refetch: refetchSharePrice } = useContractRead({
    address: vaultDefaults.address,
    abi: vaultABI,
    functionName: 'convertToAssets',
    args: [BN_1E(vaultDefaults.decimals)],
    enabled: false,
    onSuccess(data: BigNumber) {
      setSharePrice(data);
    }
  });

  async function refetch() {
    refetchTotalSupply();
    refetchAUM();
    refetchSharePrice();
  }

  const vault: Vault = {
    address: vaultDefaults.address,
    name: vaultDefaults.name,
    symbol: vaultDefaults.symbol,
    decimals: vaultDefaults.decimals,
    totalSupply: totalSupply,
    asset: {
      address: vaultDefaults.asset.address,
      name: vaultDefaults.asset.name,
      symbol: vaultDefaults.asset.symbol,
      decimals: vaultDefaults.asset.decimals,
      totalSupply: BigNumber.from(vaultDefaults.asset.totalSupply)
    },
    assetsUnderManagement: aum,
    sharePrice: sharePrice
  };
  return { vault, refetch, refetchAUM, refetchSharePrice, refetchTotalSupply };
}

const VaultDefaultsContext = createContext(defaultVault);
export default VaultDefaultsContext;
