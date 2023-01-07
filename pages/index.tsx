import Head from 'next/head';
import { CssBaseline } from '@mui/material';

import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { ConnectKitProvider, getDefaultClient } from 'connectkit';

import { loadVault } from '../lib/vault';
import VaultSummary from '../components/VaultSummary';
import MainAppBar from '../components/MainAppBar';
import ManagerSection from '../components/ManagerSection';

export default function Home(props: any) {
  const { chains, provider, webSocketProvider } = configureChains(
    [mainnet],
    [publicProvider()]
  );

  const client = createClient(
    getDefaultClient({
      appName: 'Coinflakes Investment Vault',
      chains: [mainnet, goerli]
    })
  );

  return (
    <>
      <WagmiConfig client={client}>
        <ConnectKitProvider theme="auto" mode="light">
          <Head>
            <title>Coinflakes Investment Vault</title>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width"
            />
            <link rel="icon" href="/favicon.ico" />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
            />
          </Head>
          <CssBaseline />
          <MainAppBar vault={props.vault}></MainAppBar>
          <VaultSummary vault={props.vault}></VaultSummary>
          <ManagerSection vault={props.vault}></ManagerSection>
        </ConnectKitProvider>
      </WagmiConfig>
    </>
  );
}

export async function getStaticProps() {
  return {
    props: {
      vault: await loadVault()
    }
  };
}
