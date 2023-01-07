import { Grid, Typography } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { Vault } from '../lib/vault';

export default function MainAppBar(props: { vault: Vault }) {
  return (
    <Grid container mt={'1em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={6}>
        <Typography variant="h4">{props.vault.name}</Typography>
      </Grid>
      <Grid item xs={2} textAlign="right">
        <ConnectKitButton></ConnectKitButton>
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
