import { Box, Skeleton } from '@mui/material';
import React, { useContext } from 'react';
import { useBalance } from 'wagmi';
import { numberFormat } from '../../lib/formats';
import VaultContext from '../../lib/hooks/useVault';
import Section from '../Section';

function WithdrawFunds() {
  const vault = useContext(VaultContext);
  const assetsInVault = useBalance({
    address: vault.address,
    token: vault.asset.address,
    watch: true
  });
  return (
    <Section heading="Withdraw Funds from Vault" headingAlign="center">
      <Box textAlign="left">
        Assets in Vault:&nbsp;
        {assetsInVault?.data ? (
          numberFormat(assetsInVault.data.value, vault.asset.symbol)
        ) : (
          <Skeleton variant="rectangular" width={'8em'} height={'1em'} />
        )}
      </Box>
    </Section>
  );
}

export default WithdrawFunds;
