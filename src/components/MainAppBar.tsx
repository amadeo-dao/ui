import { AccountBalanceOutlined, LinkOutlined } from '@mui/icons-material';
import { Button, ButtonGroup, Grid, Link, Typography } from '@mui/material';
import { ConnectKitButton } from 'connectkit';
import { useNetwork } from 'wagmi';
import { useVault } from '../lib/hooks/useVault';

export default function MainAppBar() {
  const { vault } = useVault();
  const { name } = vault;
  const { chain } = useNetwork();
  const { manager } = vault;

  return (
    <Grid container mt={'1em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={3}>
        <Typography variant="h4">{name}</Typography>
      </Grid>
      <Grid item xs={3} textAlign="right" paddingRight={'1em'} paddingTop={'0.2em'}>
        <ButtonGroup>
          <Button startIcon={<LinkOutlined />} variant="outlined" size="small" color="inherit">
            <Link
              href={chain?.blockExplorers?.default.url + '/address/' + vault.address}
              target={'_blank'}
              underline="none"
              rel="noreferrer"
              color={'inherit'}
            >
              Etherscan
            </Link>
          </Button>

          <Button startIcon={<AccountBalanceOutlined />} size="small" color={'inherit'}>
            <Link href={'https://debank.com/profile/' + manager} target={'_blank'} underline="none" rel="noreferrer" color={'inherit'}>
              Debank
            </Link>
          </Button>
        </ButtonGroup>
      </Grid>
      <Grid item xs={2} textAlign="right">
        <ConnectKitButton></ConnectKitButton>
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
