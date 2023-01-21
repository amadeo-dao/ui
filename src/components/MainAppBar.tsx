import { Grid, Typography } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useContext } from 'react';
import { useVault } from '../lib/hooks/useVault';

export default function MainAppBar() {
  const { vault } = useVault();
  return (
    <Grid container mt={'1em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={6}>
        <Typography variant="h4">{vault.name}</Typography>
      </Grid>
      <Grid item xs={2} textAlign="right">
        <ConnectKitButton></ConnectKitButton>
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
