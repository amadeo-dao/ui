import { Box, Grid, Skeleton } from '@mui/material';
import { useBalance } from 'wagmi';
import { numberFormat } from '../lib/formats';
import { Vault } from '../lib/vault';
import Section from './Section';

export default function ManagerSection(props: { vault: Vault }) {
  const assetsInVault = useBalance({
    address: props.vault.address,
    token: props.vault.asset.address,
    watch: true
  });
  return (
    <Grid container mt={'4em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Section heading="Withdraw Funds from Vault" headingAlign="left">
              <Box textAlign="left">
                Assets in Vault:&nbsp;
                {assetsInVault?.data ? (
                  numberFormat(
                    assetsInVault.data.value,
                    props.vault.asset.symbol
                  )
                ) : (
                  <Skeleton
                    variant="rectangular"
                    width={'8em'}
                    height={'1em'}
                  />
                )}
              </Box>
            </Section>
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
