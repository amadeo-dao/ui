import vaultAbi from '../../lib/vault.abi.json';

import { Box, Button, Grid, Skeleton } from '@mui/material';

import { CallMadeOutlined, RestartAltOutlined } from '@mui/icons-material';
import { BigNumber } from 'ethers';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useBalance, usePrepareContractWrite } from 'wagmi';
import { ADDR_DEADBEEF, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault } from '../../lib/hooks/useVault';
import { isWriteSettled, TxState } from '../../lib/TxState';
import Section from '../displays/Section';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import Erc20ApproveButton from '../inputs/Erc20ApproveButton';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';

function ReturnFunds() {
  const resetRef = useRef<SendTxButtonRef>(null);
  const { vault } = useVault();
  const [allowance, setAllowance] = useState<BigNumber>(BN_ZERO);
  const [value, setValue] = useState<BigNumber>(BN_ZERO);
  const [txState, setTxState] = useState<TxState>('idle');
  const [balance, setBalance] = useState<BigNumber>(BN_ZERO);

  const { address } = useAccount();

  const { data: balanceData } = useBalance({
    address,
    token: vault.asset.address,
    watch: true
  });
  const { value: balanceValue } = balanceData || { value: BN_ZERO };

  const { config: txConfig } = usePrepareContractWrite({
    address: vault.address,
    functionName: 'returnAssets',
    abi: vaultAbi,
    args: [address ?? ADDR_DEADBEEF, value ?? BN_ZERO]
  });

  useEffect(() => {
    if (balanceValue.eq(balance)) return;
    setBalance(balanceValue);
  }, [balanceValue, balance]);

  const onValueChange = useCallback((newValue: BigNumber | null) => {
    if (!newValue || newValue.lte(BN_ZERO)) setValue(BN_ZERO);
    else setValue(newValue);
  }, []);

  const onAllowanceChange = useCallback((newAllowance: BigNumber) => {
    setAllowance(newAllowance);
  }, []);

  function onResetButtonClick() {
    resetRef.current?.reset();
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <Section heading="Return Funds to Vault" headingAlign="center">
      <Box textAlign="left">
        Assets in Wallet:&nbsp;
        {balance ? numberFormat(balance, vault.asset.symbol) : <Skeleton variant="rectangular" width={'8em'} height={'1em'} />}
      </Box>
      <Box mt="1em" textAlign={'left'}>
        <form onSubmit={onSubmit}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <AssetAmountTextField
                symbol={vault.asset.symbol}
                label={'Assets to send to Vault'}
                decimals={vault.asset.decimals}
                maxValue={balance}
                onChange={onValueChange}
                defaultValue={BN_ZERO}
                disabled={txState !== 'idle'}
              ></AssetAmountTextField>
            </Grid>
            <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
              <Erc20ApproveButton
                token={vault.asset.address}
                amountNeeded={value}
                spender={vault.address}
                onAllowanceChange={onAllowanceChange}
                disabled={value.gt(balance)}
              ></Erc20ApproveButton>
            </Grid>
            <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
              <SendTxButton
                txConfig={txConfig}
                disabled={value.eq(BN_ZERO) || value.gt(allowance) || value.gt(balance)}
                onStateChange={setTxState}
                ref={resetRef}
                icon={<CallMadeOutlined />}
              >
                <>Return Funds</>
              </SendTxButton>
            </Grid>
            <Grid item xs={isWriteSettled(txState) ? 2 : 0} display={isWriteSettled(txState) ? 'inherit' : 'none'}>
              <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => onResetButtonClick()}>
                <RestartAltOutlined />
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Section>
  );
}

export default ReturnFunds;
