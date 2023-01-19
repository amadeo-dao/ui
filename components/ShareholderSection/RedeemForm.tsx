import { RestartAltOutlined, SwapHorizOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useContractRead, usePrepareContractWrite } from 'wagmi';
import { ADDR_DEADBEEF, BN_1E, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import { isWriteSettled, TxState } from '../../lib/TxState';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import Erc20ApproveButton, { Erc20ApproveButtonRef } from '../inputs/Erc20ApproveButton';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';

export type RedeemFormProps = {
  onSwitchMode: () => void;
};

function RedeemForm({ onSwitchMode }: RedeemFormProps) {
  const resetSendTxButton = useRef<SendTxButtonRef>(null);
  const resetApproveButton = useRef<Erc20ApproveButtonRef>(null);
  const [value, setValue] = useState<BigNumber>(BN_ZERO);
  const [maxRedeem, setMaxRedeem] = useState<BigNumber>(BN_ZERO);
  const [shares, setShares] = useState<BigNumber>(BN_ZERO);
  const [allowance, setAllowance] = useState<BigNumber>(BN_ZERO);
  const [withdrawAmount, setWithdrawAmount] = useState<BigNumber>(BN_ZERO);
  const [txState, setTxState] = useState<TxState>('idle');

  const { address: account } = useAccount();
  const { vault, refetch: refetchVault } = useVault();
  const { sharePrice, decimals: vaultDecimals } = vault;

  useContractRead({
    address: !!account ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'maxRedeem',
    args: [account ?? ADDR_DEADBEEF],
    onSuccess: (data: any) => {
      const newMaxRedeem = data as BigNumber;
      if (!maxRedeem.eq(newMaxRedeem)) setMaxRedeem(newMaxRedeem);
    },
    watch: true
  });

  useContractRead({
    address: !!account ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'balanceOf',
    args: [account ?? ADDR_DEADBEEF],
    onSuccess: (data: any) => {
      const newShares = data as BigNumber;
      if (!shares.eq(newShares)) setShares(newShares);
    },
    watch: true
  });

  const isTxActive = !!account && value.gt(BN_ZERO) && value.lte(maxRedeem) && allowance?.gte(value);
  const { config: txConfig } = usePrepareContractWrite({
    address: isTxActive ? vault.address : undefined,
    abi: vaultABI,
    functionName: 'redeem',
    args: [value, account ?? ADDR_DEADBEEF, account ?? ADDR_DEADBEEF]
  });

  useEffect(() => {
    setWithdrawAmount(value.mul(sharePrice).div(BN_1E(vaultDecimals)));
  }, [sharePrice, value, vaultDecimals]);

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
          Your shares: {numberFormat(shares, vault.symbol)}
        </Grid>
        <Grid item xs={6}>
          <AssetAmountTextField
            label="You sell"
            symbol={vault.symbol}
            decimals={vault.decimals}
            defaultValue={BN_ZERO}
            maxValue={maxRedeem}
            onChange={onChangeInputValue}
            disabled={txState !== 'idle'}
          ></AssetAmountTextField>
        </Grid>
        <Grid item xs={2} textAlign={'center'}>
          <Button variant="text" disableRipple disabled={txState !== 'idle'} onClick={onSwitchMode}>
            <SwapHorizOutlined></SwapHorizOutlined>
          </Button>
        </Grid>
        <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
          <Typography variant="body1">{numberFormat(withdrawAmount, vault.asset.symbol)}</Typography>
        </Grid>

        <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
          <Erc20ApproveButton
            token={vault.address}
            amountNeeded={value}
            spender={vault.address}
            onAllowanceChange={onAllowanceChange}
            disabled={value.eq(BN_ZERO) || value.gt(maxRedeem)}
            ref={resetApproveButton}
          ></Erc20ApproveButton>
        </Grid>
        <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
          <SendTxButton
            txConfig={txConfig}
            disabled={value.lte(BN_ZERO) || value.gt(maxRedeem) || allowance.lt(value)}
            onStateChange={onTxStateChange}
            ref={resetSendTxButton}
          >
            <>Sell Shares</>
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

export default RedeemForm;
