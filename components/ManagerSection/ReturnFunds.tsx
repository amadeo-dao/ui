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
import { BN_ZERO } from '../../lib/constants';

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
          maxValue={assets.data?.value}
          defaultValue={BN_ZERO}
        ></SendTokensWithApprovalForm>
      </Box>
    </Section>
  );
}

export default ReturnFunds;
