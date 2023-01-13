import vaultAbi from '../../lib/vault.abi.json';

import { Box, Button, Grid, Skeleton } from '@mui/material';

import { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { erc20ABI, useAccount, useBalance, useContractRead, usePrepareContractWrite } from 'wagmi';
import { numberFormat } from '../../lib/formats';
import VaultContext from '../../lib/hooks/useVault';
import Section from '../Section';
import { BN_ZERO } from '../../lib/constants';
import { BigNumber } from 'ethers';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import ApproveButton from '../inputs/ApproveButton';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';
import { RestartAltOutlined } from '@mui/icons-material';
import { TxState } from '../../lib/TxState';

function ReturnFunds() {
  const resetRef = useRef<SendTxButtonRef>(null);
  const vault = useContext(VaultContext);
  const [isApproved, setApproved] = useState<boolean>(false);
  const { address } = useAccount();
  const [value, setValue] = useState<BigNumber | null>(null);
  const [txState, setTxState] = useState<TxState>();

  const { address: owner } = useAccount();

  const { data: balance } = useBalance({
    address,
    token: vault.asset.address,
    watch: true
  });

  const { config: txConfig } = usePrepareContractWrite({
    address: vault.address,
    functionName: 'returnAssets',
    abi: vaultAbi,
    args: [address ?? '0x0', value ?? BN_ZERO],
    enabled: !!value && isApproved
  });

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: vault.asset.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [owner ?? '0x0', vault.address],
    enabled: !!owner
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: vault.asset.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [vault.address, value ?? BN_ZERO],
    enabled: !!value && value.gt('0')
  });

  useEffect(() => {
    if (!allowance || !value || value.eq(BN_ZERO)) setApproved(false);
    else setApproved(allowance.gte(value));
  }, [allowance]);

  function onValueChange(newValue: BigNumber | null) {
    if (newValue && balance && newValue.gt(balance.value)) setValue(null);
    else setValue(newValue);
    if (txState === 'Success' || txState === 'Error') resetRef.current?.reset();
  }

  function onResetButtonClick() {
    refetchAllowance();
    resetRef.current?.reset();
  }

  function onTxStateChange(state: TxState) {
    setTxState(state);
  }

  function onApprovalChange(success: boolean) {
    setApproved(success);
  }

  function isWriteSettled() {
    return txState === 'Success' || txState === 'Error';
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <Section heading="Return Funds to Vault" headingAlign="center">
      <Box textAlign="left">
        Assets in Wallet:&nbsp;
        {balance ? numberFormat(balance.value, balance.symbol) : <Skeleton variant="rectangular" width={'8em'} height={'1em'} />}
      </Box>
      <Box mt="1em" textAlign={'left'}>
        <form onSubmit={onSubmit}>
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
            <Grid item xs={isWriteSettled() ? 5 : 6}>
              <ApproveButton
                txConfig={approveConfig}
                allowance={allowance}
                amountNeeded={value}
                onChange={(success) => onApprovalChange(success)}
              ></ApproveButton>
            </Grid>
            <Grid item xs={isWriteSettled() ? 5 : 6}>
              <SendTxButton txConfig={txConfig} disabled={!isApproved} onStateChange={onTxStateChange} ref={resetRef}>
                <>Return Funds</>
              </SendTxButton>
            </Grid>
            <Grid item xs={isWriteSettled() ? 2 : 0} display={isWriteSettled() ? 'inherit' : 'none'}>
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
