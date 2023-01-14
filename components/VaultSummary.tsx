import { Grid } from '@mui/material';
import AssetsUnderManagement from './VaultSummary/AssetsUnderManagement';
import CurrentSharePrice from './VaultSummary/CurrentSharePrice';
import VaultTotalSupply from './VaultSummary/VaultTotalSupply';

export default function VaultSummary() {
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
