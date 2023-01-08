import { createContext } from 'react';
import { Vault } from '../vault';

const defaultVault: Vault = {
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

const VaultContext = createContext(defaultVault);
export default VaultContext;
