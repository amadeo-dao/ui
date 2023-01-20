import { createContext, useCallback, useContext, useState } from 'react';
import { Vault, VaultDefaults } from '../vault';

import { BigNumber } from 'ethers';
import { useContractRead } from 'wagmi';
import vaultAbiJson from '../../lib/vault.abi.json';
import { BN_1E, BN_ZERO } from '../constants';

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
  assetsUnderManagement: '0',
  assetsInUse: '0'
};

export type UseVaultReturnType = {
  vault: Vault;
  refetch: () => void;
  refetchAUM: () => void;
  refetchSharePrice: () => void;
  refetchTotalSupply: () => void;
  convertToAssets: (shares: BigNumber) => BigNumber;
  convertToShares: (assets: BigNumber) => BigNumber;
};

export function useVault(): UseVaultReturnType {
  const vaultDefaults = useContext(VaultDefaultsContext);
  const [totalSupply, setTotalSupply] = useState(BigNumber.from(vaultDefaults.totalSupply));
  const [aum, setAUM] = useState(BigNumber.from(vaultDefaults.assetsUnderManagement));
  const [aiu, setAIU] = useState(BigNumber.from(vaultDefaults.assetsInUse));
  const [sharePrice, setSharePrice] = useState(BigNumber.from(vaultDefaults.sharePrice));

  const { refetch: refetchTotalSupply } = useContractRead({
    address: vaultDefaults.address,
    abi: vaultABI,
    functionName: 'totalSupply',
    enabled: false,
    onSuccess(data: BigNumber) {
      if (data.eq(totalSupply)) return;
      setTotalSupply(data);
    }
  });

  const { refetch: refetchAUM } = useContractRead({
    address: vaultDefaults.address,
    abi: vaultABI,
    functionName: 'totalAssets',
    enabled: false,
    onSuccess(data: BigNumber) {
      if (data.eq(aum)) return;
      setAUM(data);
    }
  });

  const { refetch: refetchAIU } = useContractRead({
    address: vaultDefaults.address,
    abi: vaultABI,
    functionName: 'assetsInUse',
    enabled: false,
    onSuccess(data: BigNumber) {
      if (data.eq(aiu)) return;
      setAIU(data);
    }
  });

  const { refetch: refetchSharePrice } = useContractRead({
    address: vaultDefaults.address,
    abi: vaultABI,
    functionName: 'convertToAssets',
    args: [BN_1E(vaultDefaults.decimals)],
    enabled: false,
    onSuccess(data: BigNumber) {
      if (data.eq(sharePrice)) return;
      setSharePrice(data);
    }
  });

  const convertToAssets = useCallback(
    (shares: BigNumber): BigNumber => {
      if (shares.lte('0')) return BN_ZERO;
      return shares.mul(sharePrice).div(BN_1E(vaultDefaults.decimals));
    },
    [sharePrice, vaultDefaults.decimals]
  );

  const convertToShares = useCallback(
    (assets: BigNumber): BigNumber => {
      if (assets.lte('0')) return BN_ZERO;
      return assets.mul(BN_1E(vaultDefaults.asset.decimals)).div(sharePrice);
    },
    [sharePrice, vaultDefaults.asset.decimals]
  );

  const refetch = useCallback(() => {
    refetchAUM();
    refetchTotalSupply();
    refetchAIU();
    refetchSharePrice();
  }, [refetchAIU, refetchAUM, refetchSharePrice, refetchTotalSupply]);

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
    assetsInUse: aiu,
    sharePrice: sharePrice
  };
  return { vault, refetch, refetchAUM, refetchSharePrice, refetchTotalSupply, convertToAssets, convertToShares };
}

const VaultDefaultsContext = createContext(defaultVault);
export default VaultDefaultsContext;
