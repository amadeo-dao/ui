import Head from 'next/head';
import { CssBaseline } from '@mui/material';

import { createClient, WagmiConfig } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';

import { ConnectKitProvider, getDefaultClient } from 'connectkit';

import { loadVault } from '../../lib/vault';
import VaultSummary from '../../components/VaultSummary';
import MainAppBar from '../../components/MainAppBar';
import ManagerSection from '../../components/ManagerSection';

import _ from 'lodash';
import VaultContext from '../../lib/hooks/useVault';
import ShareholderSection from '../../components/ShareholderSection';

export default function Home(props: any) {
  const anvil = _.extend({}, mainnet, {
    id: 1337,
    name: 'Localhost',
    network: 'anvil',
    rpcUrls: {
      default: { http: ['http://localhost:8545'] }
    }
  });

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
          <VaultContext.Provider value={props.vault}>
            <Head>
              <title>{props.vault.name}</title>
              <meta name="viewport" content="initial-scale=1, width=device-width" />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <CssBaseline />
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

export async function getServerSideProps(context: any) {
  const vault = await loadVault(context.params.vault);
  return { props: { vault } };
}
