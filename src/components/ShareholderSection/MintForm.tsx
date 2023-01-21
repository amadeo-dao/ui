import { RestartAltOutlined, SwapHorizOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useBalance, usePrepareContractWrite } from 'wagmi';
import { ADDR_DEADBEEF, BN_ONE, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import { isWriteSettled, TxState } from '../../lib/TxState';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import Erc20ApproveButton, { Erc20ApproveButtonRef } from '../inputs/Erc20ApproveButton';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';

export type MintFormProps = {
  onSwitchMode: () => void;
};

function MintForm({ onSwitchMode }: MintFormProps) {
  const resetSendTxButton = useRef<SendTxButtonRef>(null);
  const resetApproveButton = useRef<Erc20ApproveButtonRef>(null);
  const [value, setValue] = useState<BigNumber>(BN_ZERO);
  const [balance, setBalance] = useState<BigNumber>(BN_ZERO);
  const [allowance, setAllowance] = useState<BigNumber>(BN_ZERO);
  const [depositAmount, setDepositAmount] = useState<BigNumber>(BN_ZERO);
  const [maxMintAmount, setMaxMintAmount] = useState<BigNumber>(BN_ZERO);
  const [approveAmount, setApproveAmount] = useState<BigNumber>(BN_ZERO);
  const [txState, setTxState] = useState<TxState>('idle');

  const { address: account } = useAccount();
  const { vault, refetch: refetchVault, convertToShares, convertToAssets } = useVault();

  useBalance({
    address: account,
    token: vault.asset.address,
    onSuccess: (newBalance) => {
      if (!balance.eq(newBalance.value)) {
        setBalance(newBalance.value);
        setMaxMintAmount(convertToShares(newBalance.value));
      }
    },
    watch: true
  });

  const isTxActive = !!account && value.gt(BN_ZERO) && allowance?.gte(value);
  const { config: txConfig } = usePrepareContractWrite({
    address: isTxActive ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'mint',
    args: [value, account ?? ADDR_DEADBEEF]
  });

  useEffect(() => {
    refetchVault();
  }, [refetchVault]);

  useEffect(() => {
    const newApproveAmount = depositAmount.add(depositAmount.eq(BN_ZERO) ? BN_ZERO : BN_ONE);
    if (newApproveAmount.eq(approveAmount)) return;
    setApproveAmount(newApproveAmount);
  }, [approveAmount, depositAmount]);

  useEffect(() => {
    const newDepositAmount = convertToAssets(value);
    if (newDepositAmount.eq(depositAmount)) return;
    setDepositAmount(newDepositAmount);
  }, [convertToAssets, depositAmount, value]);

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
      if (newState === 'success') refetchVault();
      setTxState(newState);
    },
    [refetchVault]
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
    <Box mt="1em" textAlign={'left'}>
      <Grid container spacing={1}>
        <Grid item xs={12} mb={'1em'} mt={'-0.8em'}>
          Assets in Wallet: {numberFormat(balance, vault.asset.symbol)}
        </Grid>
        <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
          <Typography variant="body1">{numberFormat(depositAmount, vault.symbol)}</Typography>
        </Grid>

        <Grid item xs={2} textAlign={'center'}>
          <Button variant="text" disableRipple disabled={txState !== 'idle'} onClick={onSwitchMode}>
            <SwapHorizOutlined></SwapHorizOutlined>
          </Button>
        </Grid>
        <Grid item xs={6}>
          <AssetAmountTextField
            label="You buy"
            symbol={vault.symbol}
            decimals={vault.decimals}
            defaultValue={BN_ZERO}
            maxValue={maxMintAmount}
            onChange={onChangeInputValue}
            disabled={txState !== 'idle'}
          ></AssetAmountTextField>
        </Grid>
        <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
          <Erc20ApproveButton
            token={vault.asset.address}
            amountNeeded={approveAmount}
            spender={vault.address}
            onAllowanceChange={onAllowanceChange}
            disabled={value.eq(BN_ZERO) || value.gt(maxMintAmount)}
            ref={resetApproveButton}
          ></Erc20ApproveButton>
        </Grid>
        <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
          <SendTxButton
            txConfig={txConfig}
            disabled={value.lte(BN_ZERO) || value.gt(maxMintAmount) || allowance.lt(approveAmount)}
            onStateChange={onTxStateChange}
            ref={resetSendTxButton}
          >
            <>Buy Shares</>
          </SendTxButton>
        </Grid>
        <Grid item xs={isWriteSettled(txState) ? 2 : 0} display={isWriteSettled(txState) ? 'inherit' : 'none'}>
          <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => handleResetButtonClick()}>
            <RestartAltOutlined />
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default MintForm;
