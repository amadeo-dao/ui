import { Grid } from '@mui/material';
import { Vault } from '../lib/vault';
import AssetsUnderManagement from './AssetsUnderManagement';
import CurrentSharePrice from './CurrentSharePrice';
import VaultTotalSupply from './VaultTotalSupply';

export default function VaultSummary(props: { vault: Vault }) {
  return (
    <Grid container mt={'4em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <Grid container spacing={5}>
          <Grid item xs={4}>
            <AssetsUnderManagement vault={props.vault}></AssetsUnderManagement>
          </Grid>
          <Grid item xs={4}>
            <CurrentSharePrice vault={props.vault}></CurrentSharePrice>
          </Grid>
          <Grid item xs={4}>
            <VaultTotalSupply vault={props.vault}></VaultTotalSupply>
          </Grid>
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
    </Grid>
  );
}
