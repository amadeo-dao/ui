import { createContext, useCallback, useMemo, useState } from 'react';

import { BigNumber } from 'ethers';
import { useParams } from 'react-router-dom';
import { erc20ABI, useContractRead } from 'wagmi';
import { ADDR_DEADBEEF, BN_1E, BN_ONE, BN_ZERO } from '../constants';
import EvmAddress from '../evmAddress';
import vaultABIJson from '../vault.abi.json';

export const vaultABI = vaultABIJson;

export type Vault = {
  address: EvmAddress;
  name: string;
  symbol: string;
  decimals: number;
  asset: {
    address: EvmAddress;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: BigNumber;
  };
  assetsInUse: BigNumber;
  assetsUnderManagement: BigNumber;
  sharePrice: BigNumber;
  totalSupply: BigNumber;
  manager: EvmAddress;
};

export type UseVaultReturnType = {
  vault: Vault;
  refetch: () => void;
  refetchAUM: () => void;
  refetchAIU: () => void;
  refetchSharePrice: () => void;
  refetchTotalSupply: () => void;
  convertToAssets: (shares: BigNumber) => BigNumber;
  convertToShares: (assets: BigNumber) => BigNumber;
};

export type InitialVaultProps = {
  address?: EvmAddress;
};

export const InitalVaultContext = createContext<InitialVaultProps>({});

export function useVault(): UseVaultReturnType {
  const { address } = useParams();

  const [name, setName] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState(BN_ZERO);
  const [aum, setAUM] = useState(BN_ZERO);
  const [aiu, setAIU] = useState(BN_ZERO);
  const [sharePrice, setSharePrice] = useState(BN_ONE);

  useContractRead({
    address,
    abi: vaultABI,
    functionName: 'name',
    onSuccess(newName: string) {
      setName(newName);
    }
  });
  const { data: symbol } = useContractRead({
    address,
    abi: vaultABI,
    functionName: 'symbol'
  });

  let { data: decimals } = useContractRead({
    address,
    abi: vaultABI,
    functionName: 'decimals'
  });
  decimals = decimals ?? 18;

  let { data: manager } = useContractRead({
    address,
    abi: vaultABI,
    functionName: 'manager'
  });

  const { data: assetAddress } = useContractRead({
    address: address as EvmAddress | undefined,
    abi: vaultABI,
    functionName: 'asset'
  });

  let { data: assetName } = useContractRead({
    address: assetAddress as EvmAddress | undefined,
    abi: erc20ABI,
    functionName: 'name'
  });
  assetName = assetName as string;

  let { data: assetSymbol } = useContractRead({
    address: assetAddress as EvmAddress | undefined,
    abi: erc20ABI,
    functionName: 'symbol'
  });
  assetSymbol = assetSymbol as string;

  let { data: assetDecimals } = useContractRead({
    address: assetAddress as EvmAddress | undefined,
    abi: erc20ABI,
    functionName: 'decimals'
  });
  assetDecimals = assetDecimals as number;

  let { data: assetTotalSupply } = useContractRead({
    address: assetAddress as EvmAddress | undefined,
    abi: erc20ABI,
    functionName: 'totalSupply'
  });
  assetTotalSupply = assetTotalSupply as BigNumber;

  const { refetch: _refetchTotalSupply, isLoading: _isTotalSupplyLoading } = useContractRead({
    address: address !== ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'totalSupply',
    enabled: address !== ADDR_DEADBEEF,
    onSuccess(data: BigNumber) {
      if (data.eq(totalSupply)) return;
      setTotalSupply(data);
    }
  });

  const refetchTotalSupply = useCallback(() => {
    if (_isTotalSupplyLoading) return;
    _refetchTotalSupply();
  }, [_refetchTotalSupply, _isTotalSupplyLoading]);

  const { refetch: _refetchAUM, isLoading: _isAUMLoading } = useContractRead({
    address: address !== ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'totalAssets',
    enabled: address !== ADDR_DEADBEEF,
    onSuccess(data: BigNumber) {
      if (data.eq(aum)) return;
      setAUM(data);
    }
  });

  const refetchAUM = useCallback(() => {
    if (_isAUMLoading) return;
    _refetchAUM();
  }, [_refetchAUM, _isAUMLoading]);

  const { refetch: _refetchAIU, isLoading: _isAIULoading } = useContractRead({
    address: address !== ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'assetsInUse',
    enabled: address !== ADDR_DEADBEEF,
    onSuccess(data: BigNumber) {
      if (data.eq(aiu)) return;
      setAIU(data);
    }
  });

  const refetchAIU = useCallback(() => {
    if (_isAIULoading) return;
    _refetchAIU();
  }, [_refetchAIU, _isAIULoading]);

  const { refetch: _refetchSharePrice, isLoading: _isSharePriceLoading } = useContractRead({
    address: address !== ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'convertToAssets',
    args: [BN_1E(decimals as number)],
    enabled: address !== ADDR_DEADBEEF,
    onSuccess(data: BigNumber) {
      if (data.eq(sharePrice)) return;
      setSharePrice(data);
    }
  });

  const refetchSharePrice = useCallback(() => {
    if (_isSharePriceLoading) return;
    _refetchSharePrice();
  }, [_refetchSharePrice, _isSharePriceLoading]);

  const convertToAssets = useCallback(
    (shares: BigNumber): BigNumber => {
      if (shares.lte('0')) return BN_ZERO;
      return shares.mul(sharePrice).div(BN_1E(decimals as number));
    },
    [sharePrice, decimals]
  );

  const convertToShares = useCallback(
    (assets: BigNumber): BigNumber => {
      if (assets.lte('0')) return BN_ZERO;
      return assets.mul(BN_1E(assetDecimals as number)).div(sharePrice);
    },
    [sharePrice, assetDecimals]
  );

  const refetch = useCallback(() => {
    refetchAUM();
    refetchTotalSupply();
    refetchAIU();
    refetchSharePrice();
  }, [refetchAIU, refetchAUM, refetchSharePrice, refetchTotalSupply]);

  const vault: Vault = useMemo(() => {
    const asset = {
      address: assetAddress as EvmAddress,
      name: assetName as string,
      symbol: assetSymbol as string,
      decimals: assetDecimals as number,
      totalSupply: assetTotalSupply as BigNumber
    };
    return {
      address: address as EvmAddress,
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      asset,
      totalSupply,
      assetsUnderManagement: aum,
      assetsInUse: aiu,
      sharePrice: sharePrice,
      manager: manager as EvmAddress
    };
  }, [
    address,
    aiu,
    assetAddress,
    assetDecimals,
    assetName,
    assetSymbol,
    assetTotalSupply,
    aum,
    decimals,
    name,
    sharePrice,
    symbol,
    totalSupply,
    manager
  ]);
  return {
    vault,
    refetch,
    refetchAIU,
    refetchAUM,
    refetchSharePrice,
    refetchTotalSupply,
    convertToAssets,
    convertToShares
  };
}
