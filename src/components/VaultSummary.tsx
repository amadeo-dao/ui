import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { useVault, vaultABI } from '../lib/hooks/useVault';
import AssetsUnderManagement from './VaultSummary/AssetsUnderManagement';
import CurrentSharePrice from './VaultSummary/CurrentSharePrice';
import VaultTotalSupply from './VaultSummary/VaultTotalSupply';
import YourAssets from './VaultSummary/YourAssets';
import YourShares from './VaultSummary/YourShares';

export default function VaultSummary() {
  const { refetch } = useVault();
  const { address: account } = useAccount();
  const { vault } = useVault();
  const { address: vaultAddress } = vault;
  const { data: isShareholder } = useContractRead({
    address: account ? vaultAddress : undefined,
    abi: vaultABI,
    functionName: 'isShareholder',
    args: [account]
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <Grid container mt={'4em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <Grid container spacing={5}>
          <Grid item xs={4}>
            {isShareholder ? <YourAssets></YourAssets> : <AssetsUnderManagement></AssetsUnderManagement>}
          </Grid>
          <Grid item xs={4}>
            <CurrentSharePrice></CurrentSharePrice>
          </Grid>
          <Grid item xs={4}>
            {isShareholder ? <YourShares></YourShares> : <VaultTotalSupply></VaultTotalSupply>}
          </Grid>
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
    </Grid>
  );
}
