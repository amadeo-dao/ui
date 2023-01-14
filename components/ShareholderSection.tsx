import { Grid } from '@mui/material';
import React, { useContext } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import VaultContext, { vaultABI } from '../lib/hooks/useVault';
import BuyShares from './ShareholderSection/BuyShares';
import SellShares from './ShareholderSection/SellShares';

function ShareholderSection() {
  const vault = useContext(VaultContext);

  const { address: account } = useAccount();

  const { data: isShareholder } = useContractRead({
    address: vault.address,
    abi: vaultABI,
    functionName: 'isShareholder',
    args: [account],
    enabled: !!account
  });

  if (!isShareholder) return <></>;

  return (
    <Grid container mt={'4em'}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <BuyShares></BuyShares>
          </Grid>
          <Grid item xs={6}>
            <SellShares></SellShares>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ShareholderSection;
