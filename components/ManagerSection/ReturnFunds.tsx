import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Skeleton
} from '@mui/material';
import {
  DoneOutline,
  RestartAltOutlined,
  SendOutlined
} from '@mui/icons-material';

import { ChangeEvent, useContext, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { numberFormat } from '../../lib/formats';
import VaultContext from '../../lib/hooks/useVault';
import Section from '../Section';
import SendTokensWithApprovalForm from '../inputs/SendTokensWithApprovalForm';

function ReturnFunds() {
  const vault = useContext(VaultContext);
  const { address } = useAccount();

  const assets = useBalance({
    address,
    token: vault.asset.address,
    watch: true
  });

  return (
    <Section heading="Return Funds to Vault" headingAlign="center">
      <Box textAlign="left">
        Assets in Wallet:&nbsp;
        {assets?.data ? (
          numberFormat(assets.data.value, assets.data.symbol)
        ) : (
          <Skeleton variant="rectangular" width={'8em'} height={'1em'} />
        )}
      </Box>
      <Box mt="1em" textAlign={'left'}>
        <SendTokensWithApprovalForm
          asset={vault.asset}
          recipient={vault.address}
        ></SendTokensWithApprovalForm>
      </Box>
    </Section>
  );
}

export default ReturnFunds;
