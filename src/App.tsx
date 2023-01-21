import { CssBaseline } from '@mui/material';

import { goerli, mainnet } from 'wagmi/chains';

import { ConnectKitProvider, getDefaultClient } from 'connectkit';

import MainAppBar from './components/MainAppBar';

import { createClient, WagmiConfig } from 'wagmi';
import DocumentTitle from './components/DocumentTitle';
import ManagerSection from './components/ManagerSection';
import ShareholderSection from './components/ShareholderSection';
import VaultSummary from './components/VaultSummary';
import EvmAddress from './lib/evmAddress';
import { InitalVaultContext } from './lib/hooks/useVault';

export default function Home() {
  const anvil = Object.assign(
    {},
    { ...mainnet },
    {
      id: 1337,
      name: 'Localhost',
      network: 'anvil',
      rpcUrls: {
        default: { http: ['http://localhost:8545'] }
      }
    }
  );

  const client = createClient(
    getDefaultClient({
      appName: 'Coinflakes Investment Vault',
      chains: process.env.NODE_ENV === 'development' ? [anvil] : [mainnet, goerli]
    })
  );

  return (
    <>
      <WagmiConfig client={client}>
        <ConnectKitProvider theme="auto" mode="light">
          <CssBaseline />
          <InitalVaultContext.Provider value={{ address: process.env.REACT_APP_VAULT as EvmAddress }}>
            <DocumentTitle></DocumentTitle>
            <MainAppBar></MainAppBar>
            <VaultSummary></VaultSummary>
            <ManagerSection></ManagerSection>
            <ShareholderSection></ShareholderSection>
          </InitalVaultContext.Provider>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
