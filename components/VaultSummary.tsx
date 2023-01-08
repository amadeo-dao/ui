import { Grid } from '@mui/material';
import { useContext } from 'react';
import VaultContext from '../lib/hooks/useVault';
import AssetsUnderManagement from './AssetsUnderManagement';
import CurrentSharePrice from './CurrentSharePrice';
import VaultTotalSupply from './VaultTotalSupply';

export default function VaultSummary() {
  const vault = useContext(VaultContext);
  return (
    <Grid container mt={'4em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <Grid container spacing={5}>
          <Grid item xs={4}>
            <AssetsUnderManagement></AssetsUnderManagement>
          </Grid>
          <Grid item xs={4}>
            <CurrentSharePrice></CurrentSharePrice>
          </Grid>
          <Grid item xs={4}>
            <VaultTotalSupply></VaultTotalSupply>
          </Grid>
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
    </Grid>
  );
}
