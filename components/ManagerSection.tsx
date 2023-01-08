import { Grid } from '@mui/material';
import WithdrawFunds from './ManagerSection/WithdrawFunds';
import Section from './Section';

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
            <Section heading="Return Funds to Vault"></Section>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
