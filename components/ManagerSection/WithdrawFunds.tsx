import vaultAbi from '../../lib/vault.abi.json';

import { CallReceivedOutlined, RestartAltOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Skeleton } from '@mui/material';
import { BigNumber } from 'ethers';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { useAccount, useBalance, usePrepareContractWrite } from 'wagmi';
import { BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { TxState } from '../../lib/TxState';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';
import Section from '../displays/Section';
import { useVault } from '../../lib/hooks/useVault';

function WithdrawFunds() {
  const resetRef = useRef<SendTxButtonRef>(null);

  const [value, setValue] = useState<BigNumber | null>();
  const [txState, setTxState] = useState<TxState>();
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const { vault } = useVault();

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

  useEffect(() => {
    if (txState === 'Success') setButtonDisabled(false);
    else if (!!value && !!balance && value.gt(BN_ZERO) && value.lte(balance.value)) setButtonDisabled(false);
    else setButtonDisabled(true);
  }, [txState, value, balance]);

  function onTxStateChange(newState: TxState) {
    setTxState(newState);
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
              label={'Assets to receive from Vault'}
              decimals={vault.asset.decimals}
              maxValue={balance?.value}
              onChange={onValueChange}
              defaultValue={BN_ZERO}
              disabled={txState === 'Loading'}
            ></AssetAmountTextField>
          </Grid>
          <Grid item xs={isWriteSettled() ? 10 : 12}>
            <SendTxButton
              txConfig={txConfig}
              disabled={isButtonDisabled}
              onStateChange={onTxStateChange}
              ref={resetRef}
              icon={<CallReceivedOutlined />}
            >
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
