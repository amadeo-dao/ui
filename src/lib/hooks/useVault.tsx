import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { BigNumber } from 'ethers';
import { useContractRead, useToken } from 'wagmi';
import vaultAbiJson from '../../lib/vault.abi.json';
import { ADDR_DEADBEEF, BN_1E, BN_ONE, BN_ZERO } from '../constants';
import { ERC20 } from '../erc20';
import EvmAddress from '../evmAddress';

export const vaultABI = vaultAbiJson;

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
};

export type InitialVaultInfo = { address: EvmAddress };

export type UseVaultReturnType = {
  vault: Vault;
  vaultMemo: { totalSupply: BigNumber };
  refetch: () => void;
  refetchAUM: () => void;
  refetchAIU: () => void;
  refetchSharePrice: () => void;
  refetchTotalSupply: () => void;
  convertToAssets: (shares: BigNumber) => BigNumber;
  convertToShares: (assets: BigNumber) => BigNumber;
};

export function useVault(): UseVaultReturnType {
  const { address } = useContext(VaultContext);
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [decimals, setDecimals] = useState<number>(18);
  const [asset, setAsset] = useState<ERC20>({
    address: ADDR_DEADBEEF,
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: BN_ZERO
  });

  const [assetAddress, setAssetAddress] = useState<EvmAddress>(ADDR_DEADBEEF);

  const [totalSupply, setTotalSupply] = useState(BN_ZERO);
  const [aum, setAUM] = useState(BN_ZERO);
  const [aiu, setAIU] = useState(BN_ZERO);
  const [sharePrice, setSharePrice] = useState(BN_ONE);

  useToken({
    address: address,
    onSuccess: (data) => {
      if (data.name !== name) setName(data.name);
      if (data.symbol !== symbol) setSymbol(data.symbol);
      if (data.decimals !== decimals) setDecimals(data.decimals);
      if (!data.totalSupply.value.eq(totalSupply)) setTotalSupply(data.totalSupply.value);
      refetchAssetAddress();
    }
  });

  const { refetch: refetchAssetAddress } = useContractRead({
    address: address,
    abi: vaultABI,
    functionName: 'asset',
    onSuccess: (data: EvmAddress) => {
      setAssetAddress(data);
      refetchAsset();
    }
  });

  const { refetch: refetchAsset } = useToken({
    address: assetAddress !== ADDR_DEADBEEF ? assetAddress : undefined,
    onSuccess: (data) => {
      setAsset({ ...data, totalSupply: data.totalSupply.value });
    }
  });

  const { refetch: _refetchTotalSupply, isLoading: _isTotalSupplyLoading } = useContractRead({
    address: address === ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'totalSupply',
    enabled: false,
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
    address: address === ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'totalAssets',
    enabled: false,
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
    address: address === ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'assetsInUse',
    enabled: false,
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
    address: address === ADDR_DEADBEEF ? address : undefined,
    abi: vaultABI,
    functionName: 'convertToAssets',
    args: [BN_1E(decimals)],
    enabled: false,
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
      return shares.mul(sharePrice).div(BN_1E(decimals));
    },
    [sharePrice, decimals]
  );

  const convertToShares = useCallback(
    (assets: BigNumber): BigNumber => {
      if (assets.lte('0')) return BN_ZERO;
      return assets.mul(BN_1E(asset.decimals)).div(sharePrice);
    },
    [sharePrice, asset.decimals]
  );

  const refetch = useCallback(() => {
    refetchAUM();
    refetchTotalSupply();
    refetchAIU();
    refetchSharePrice();
  }, [refetchAIU, refetchAUM, refetchSharePrice, refetchTotalSupply]);

  const vaultMemo = useMemo(() => {
    return { totalSupply };
  }, [totalSupply]);

  const vault: Vault = {
    address,
    name,
    symbol,
    decimals,
    asset,
    totalSupply,
    assetsUnderManagement: aum,
    assetsInUse: aiu,
    sharePrice: sharePrice
  };
  return { vault, vaultMemo, refetch, refetchAIU, refetchAUM, refetchSharePrice, refetchTotalSupply, convertToAssets, convertToShares };
}

export const VaultContext = createContext<InitialVaultInfo>({ address: ADDR_DEADBEEF });
