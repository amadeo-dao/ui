import { Grid } from '@mui/material';
import ReturnFunds from './ManagerSection/ReturnFunds';
import ShareholderManagement from './ManagerSection/ShareholderManagement';
import WithdrawFunds from './ManagerSection/WithdrawFunds';

export default function ManagerSection() {
  return (
    <Grid container mt={'4em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <WithdrawFunds></WithdrawFunds>
          </Grid>
          <Grid item xs={6}>
            <ReturnFunds></ReturnFunds>
          </Grid>
        </Grid>
        <Grid item xs={12} mt={'4em'}>
          <ShareholderManagement></ShareholderManagement>
        </Grid>
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
