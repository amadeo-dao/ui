import vaultAbi from '../../lib/vault.abi.json';

import { RestartAltOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Skeleton } from '@mui/material';
import { BigNumber } from 'ethers';
import React, { useContext, useRef, useState } from 'react';
import { useAccount, useBalance, usePrepareContractWrite } from 'wagmi';
import { BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import VaultContext from '../../lib/hooks/useVault';
import { TxState } from '../../lib/TxState';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';
import Section from '../Section';

function WithdrawFunds() {
  const [value, setValue] = useState<BigNumber | null>();
  const [txState, setTxState] = useState<TxState>('Idle');

  const resetRef = useRef<SendTxButtonRef>(null);

  const vault = useContext(VaultContext);

  const { address: owner } = useAccount();

  const { data: balance } = useBalance({
    address: vault.address,
    token: vault.asset.address,
    watch: true
  });

  const { config: txConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultAbi,
    functionName: 'useAssets',
    args: [owner, value],
    enabled: !!owner && !!value
  });

  function onValueChange(newValue: BigNumber | null) {
    if (newValue && balance && newValue.gt(balance.value)) setValue(null);
    else setValue(newValue);
    if (txState === 'Success' || txState === 'Error') resetRef.current?.reset();
  }
  function onResetButtonClick() {
    resetRef.current?.reset();
  }

  function isWriteSettled() {
    return txState === 'Success' || txState === 'Error';
  }

  function isValueValid() {
    return !!value && !!balance && value.gt(BN_ZERO) && value.lte(balance.value);
  }

  return (
    <Section heading="Withdraw Funds from Vault" headingAlign="center">
      <Box textAlign="left">
        Assets in Vault:&nbsp;
        {balance?.value ? numberFormat(balance.value, vault.asset.symbol) : <Skeleton variant="rectangular" width={'8em'} height={'1em'} />}
      </Box>
      <Box mt="1em" textAlign={'left'}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <AssetAmountTextField
              symbol={vault.asset.symbol}
              decimals={vault.asset.decimals}
              maxValue={balance?.value}
              onChange={onValueChange}
              defaultValue={BN_ZERO}
              disabled={txState === 'Loading'}
            ></AssetAmountTextField>
          </Grid>
          <Grid item xs={isWriteSettled() ? 10 : 12}>
            <SendTxButton txConfig={txConfig} disabled={!isValueValid()} onStateChange={setTxState} ref={resetRef}>
              <>Withdraw Funds</>
            </SendTxButton>
          </Grid>
          <Grid item xs={isWriteSettled() ? 2 : 0} display={isWriteSettled() ? 'inherit' : 'none'}>
            <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => onResetButtonClick()}>
              <RestartAltOutlined />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Section>
  );
}

export default WithdrawFunds;
