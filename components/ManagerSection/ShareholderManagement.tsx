import { AddOutlined, CheckOutlined, RemoveOutlined } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useAccount, useContractRead, usePrepareContractWrite } from 'wagmi';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import AddressTextField from '../inputs/AddressTextField';
import SendTxButton from '../inputs/SendTxButton';
import Section from '../displays/Section';

function ShareholderManagement() {
  const { vault } = useVault();
  const [address, setAddress] = useState<string | null>(null);

  const { address: manager } = useAccount();

  const { data: isShareholder, refetch: refetchIsShareholder } = useContractRead({
    address: vault.address,
    abi: vaultABI,
    functionName: 'isShareholder',
    args: [address],
    enabled: !!address
  });
  const { config: addTxConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'whitelistShareholder',
    args: [address ?? '0x001111'],
    enabled: !!address
  });
  const { config: removeTxConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'revokeShareholder',
    args: [address ?? '0x0ddd'],
    enabled: !!address
  });

  useEffect(() => {
    refetchIsShareholder();
  }, [address]);

  function onValueChange(newValue: string | null) {
    if (newValue === manager) setAddress(null);
    else setAddress(newValue);
  }

  function onAddTxStateChange() {
    refetchIsShareholder();
  }

  function onRemoveTxStateChange() {
    refetchIsShareholder();
  }

  return (
    <Section heading="Shareholder Management">
      <Box mt="1em" textAlign={'left'}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <AddressTextField label="Shareholder Address" defaultValue="" onValueChange={onValueChange}></AddressTextField>
          </Grid>
          <Grid item xs={3}>
            <SendTxButton
              txConfig={addTxConfig}
              disabled={!address || !!isShareholder}
              onStateChange={onAddTxStateChange}
              icon={<AddOutlined />}
            >
              Add Shareholder
            </SendTxButton>
          </Grid>
          <Grid item xs={3}>
            <SendTxButton
              txConfig={removeTxConfig}
              disabled={!isShareholder}
              onStateChange={onRemoveTxStateChange}
              icon={<RemoveOutlined />}
            >
              Remove Shareholder
            </SendTxButton>
          </Grid>
          <Grid item xs={12} sx={{ display: !!address && isShareholder ? 'inherit' : 'none' }}>
            <>
              <CheckOutlined color="success" />
              <Typography variant="body1">
                <b>{address}</b> is a shareholder.
              </Typography>
            </>
          </Grid>
        </Grid>
      </Box>
    </Section>
  );
}

export default ShareholderManagement;
