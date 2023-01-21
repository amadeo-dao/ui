import { CssBaseline } from '@mui/material';

import { goerli, mainnet } from 'wagmi/chains';

import { ConnectKitProvider, getDefaultClient } from 'connectkit';

import { VaultContext } from './lib/hooks/useVault';

import MainAppBar from './components/MainAppBar';
import ManagerSection from './components/ManagerSection';
import VaultSummary from './components/VaultSummary';

import { createClient, WagmiConfig } from 'wagmi';
import DocumentTitle from './components/DocumentTitle';
import ShareholderSection from './components/ShareholderSection';

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
          <VaultContext.Provider value={{ address: '0xe32a8bf47b356e6eb09f0db3300809c04ab4e02f' }}>
            <CssBaseline />
            <DocumentTitle></DocumentTitle>
            <MainAppBar></MainAppBar>
            <VaultSummary></VaultSummary>
            <ManagerSection></ManagerSection>
            <ShareholderSection></ShareholderSection>
          </VaultContext.Provider>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}
