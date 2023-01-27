import { AddOutlined, CheckOutlined, RemoveOutlined } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useAccount, useContractRead, usePrepareContractWrite } from 'wagmi';
import { ADDR_DEADBEEF } from '../../lib/constants';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import Section from '../displays/Section';
import AddressTextField from '../inputs/AddressTextField';
import SendTxButton from '../inputs/SendTxButton';

function ShareholderManagement() {
  const { vault } = useVault();
  const [address, setAddress] = useState<string | null>(null);

  const { address: manager } = useAccount();

  const isActive = !!address && !!vault.address;
  const { data: isShareholder, refetch: refetchIsShareholder } = useContractRead({
    address: isActive ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'isShareholder',
    args: [address === null ? ADDR_DEADBEEF : address],
    enabled: isActive
  });
  const { config: addTxConfig } = usePrepareContractWrite({
    address: isActive ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'whitelistShareholder',
    args: [address === null ? ADDR_DEADBEEF : address],
    enabled: isActive
  });
  const { config: removeTxConfig } = usePrepareContractWrite({
    address: isActive ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'revokeShareholder',
    args: [address === null ? ADDR_DEADBEEF : address],
    enabled: isActive
  });

  useEffect(() => {
    refetchIsShareholder();
  }, [address, refetchIsShareholder]);

  const onValueChange = useCallback(
    (newValue: string | null) => {
      if (newValue === manager) setAddress(null);
      else setAddress(newValue);
    },
    [manager]
  );

  const onAddTxStateChange = useCallback(() => {
    refetchIsShareholder();
  }, [refetchIsShareholder]);

  const onRemoveTxStateChange = useCallback(() => {
    refetchIsShareholder();
  }, [refetchIsShareholder]);

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
