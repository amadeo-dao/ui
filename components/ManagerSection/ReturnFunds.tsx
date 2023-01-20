import { CallMade, RestartAltOutlined } from '@mui/icons-material';
import { Box, Button, Grid } from '@mui/material';
import { BigNumber } from 'ethers';
import { useCallback, useRef, useState } from 'react';
import { useAccount, useBalance, usePrepareContractWrite } from 'wagmi';
import { ADDR_DEADBEEF, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import { isWriteSettled, TxState } from '../../lib/TxState';
import Section from '../displays/Section';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import Erc20ApproveButton, { Erc20ApproveButtonRef } from '../inputs/Erc20ApproveButton';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';

function ReturnFunds() {
  const resetSendTxButton = useRef<SendTxButtonRef>(null);
  const resetApproveButton = useRef<Erc20ApproveButtonRef>(null);
  const [value, setValue] = useState<BigNumber>(BN_ZERO);
  const [balance, setBalance] = useState<BigNumber>(BN_ZERO);
  const [allowance, setAllowance] = useState<BigNumber>(BN_ZERO);
  const [txState, setTxState] = useState<TxState>('idle');

  const { address: account } = useAccount();
  const { vault, refetch: refetchVault } = useVault();

  useBalance({
    address: account,
    token: vault.asset.address,
    onSuccess: (newBalance) => {
      if (!balance.eq(newBalance.value)) setBalance(newBalance.value);
    },
    watch: true
  });

  const isTxActive = !!account && value.gt(BN_ZERO) && allowance?.gte(value);
  const { config: txConfig } = usePrepareContractWrite({
    address: isTxActive ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'returnAssets',
    args: [account ?? ADDR_DEADBEEF, value]
  });

  const onChangeInputValue = useCallback(
    (newValue: BigNumber | null) => {
      if (newValue && newValue.eq(value)) return;
      if (!newValue) setValue(BN_ZERO);
      else setValue(newValue);
    },
    [value]
  );

  const onTxStateChange = useCallback(
    (newState: TxState) => {
      if (txState === newState) return;
      if (newState === 'success') refetchVault();
      setTxState(newState);
    },
    [refetchVault, txState]
  );

  const onAllowanceChange = useCallback(
    (newAllowance: BigNumber) => {
      if (!newAllowance.eq(allowance)) setAllowance(newAllowance);
    },
    [allowance]
  );

  function handleResetButtonClick() {
    resetApproveButton.current?.reset();
    resetSendTxButton.current?.reset();
  }

  return (
    <Section heading="Return Funds to Vault" headingAlign="center">
      <Box textAlign="left">
        Assets in Wallet:&nbsp;
        {numberFormat(balance, vault.asset.symbol)}
      </Box>

      <Box mt="1em" textAlign={'left'}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <AssetAmountTextField
              label="You send"
              symbol={vault.asset.symbol}
              decimals={vault.asset.decimals}
              defaultValue={BN_ZERO}
              maxValue={balance}
              onChange={onChangeInputValue}
              disabled={txState !== 'idle'}
            ></AssetAmountTextField>
          </Grid>
          <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
            <Erc20ApproveButton
              token={vault.asset.address}
              amountNeeded={value}
              spender={vault.address}
              onAllowanceChange={onAllowanceChange}
              disabled={value.eq(BN_ZERO) || value.gt(balance)}
              ref={resetApproveButton}
            ></Erc20ApproveButton>
          </Grid>
          <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
            <SendTxButton
              txConfig={txConfig}
              disabled={value.lte(BN_ZERO) || value.gt(balance) || allowance.lt(value)}
              onStateChange={onTxStateChange}
              ref={resetSendTxButton}
              icon={<CallMade></CallMade>}
            >
              <>Return Funds</>
            </SendTxButton>
          </Grid>
          <Grid item xs={isWriteSettled(txState) ? 2 : 0} display={isWriteSettled(txState) ? 'inherit' : 'none'}>
            <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => handleResetButtonClick()}>
              <RestartAltOutlined />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Section>
  );
}

export default ReturnFunds;
