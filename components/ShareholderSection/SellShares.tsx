import { RestartAltOutlined, SwapHorizOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { erc20ABI, useAccount, useBalance, useContractRead, usePrepareContractWrite } from 'wagmi';
import { ADDR_DEADBEEF, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import { isWriteSettled, TxState } from '../../lib/TxState';
import Section from '../displays/Section';
import ApproveButton from '../inputs/ApproveButton';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';

function BuyShares() {
  const resetRef = useRef<SendTxButtonRef>(null);
  const [vaultBalance, setVaulBalance] = useState<BigNumber>(BN_ZERO);
  const [withdrawAmount, setWithdrawAmount] = useState<BigNumber>(BN_ZERO);
  const [redeemAmount, setRedeemAmount] = useState<BigNumber>(BN_ZERO);
  const [approvalAmount, setApprovalAmount] = useState<BigNumber>(BN_ZERO);
  const [txState, setTxState] = useState<TxState>('idle');
  const [isApproved, setApproved] = useState<boolean>(false);

  const [isWithdrawMode, setWithdrawMode] = useState<boolean>(true);

  const { address: account } = useAccount();

  const { vault, refetch: refetchVault, convertToAssets, convertToShares } = useVault();

  const { data: vaultBalanceData } = useBalance({
    address: vault.address,
    token: vault.asset.address,
    watch: true
  });
  const { value: vaultBalanceValue } = vaultBalanceData || { value: BN_ZERO };

  const { data: accountShares } = useBalance({
    address: account,
    token: vault.address,
    watch: true
  });

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: vault.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [account ?? '0x0', vault.address],
    enabled: !!account
  });

  const { data: maxRedeemable, refetch: refetchMaxRedeem } = useContractRead({
    address: vault.address,
    abi: vaultABI,
    functionName: 'maxRedeem',
    args: [account ?? ADDR_DEADBEEF]
  });

  const { data: maxWithdrawable, refetch: refetchMaxWithdraw } = useContractRead({
    address: vault.address,
    abi: vaultABI,
    functionName: 'maxWithdraw',
    args: [account ?? ADDR_DEADBEEF]
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [vault.address, approvalAmount]
  });

  const { config: redeemTxConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'redeem',
    args: [redeemAmount ?? BN_ZERO, account ?? ADDR_DEADBEEF, account ?? ADDR_DEADBEEF]
  });

  const { config: withdrawTxConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'withdraw',
    args: [withdrawAmount ?? BN_ZERO, account ?? ADDR_DEADBEEF, account ?? ADDR_DEADBEEF]
  });

  useEffect(() => {
    if (vaultBalanceValue.eq(vaultBalance)) return;
    setVaulBalance(vaultBalanceValue);
  }, [vaultBalance, vaultBalanceValue]);

  useEffect(() => {
    refetchMaxRedeem();
    refetchMaxWithdraw();
  }, [refetchMaxRedeem, refetchMaxWithdraw, vaultBalance]);

  useEffect(() => {
    if (!allowance || !approvalAmount || approvalAmount.eq(BN_ZERO)) setApproved(false);
    else setApproved(allowance.gte(approvalAmount));
  }, [allowance, approvalAmount]);

  const onWithdrawInputChange = useCallback(
    (newValue: BigNumber | null) => {
      if (!newValue) newValue = BN_ZERO;
      setWithdrawAmount(newValue);
      setRedeemAmount(convertToShares(newValue));
      if (newValue.eq(BN_ZERO)) setApprovalAmount(BN_ZERO);
      else setApprovalAmount(convertToShares(newValue).add(1));
    },
    [convertToShares]
  );

  const onRedeemInputChange = useCallback(
    (newValue: BigNumber | null) => {
      setWithdrawAmount(convertToShares(newValue ?? BN_ZERO));
      setRedeemAmount(newValue ?? BN_ZERO);
      setApprovalAmount(newValue ?? BN_ZERO);
    },
    [convertToShares]
  );

  function onSwitchButtonClick() {
    setWithdrawMode(!isWithdrawMode);
  }

  const onTxStateChange = useCallback(
    (newState: TxState) => {
      setTxState(newState);
      if (isWriteSettled(newState)) {
        refetchVault();
        refetchMaxRedeem();
        refetchMaxWithdraw();
      }
    },
    [refetchMaxRedeem, refetchMaxWithdraw, refetchVault]
  );

  const onApprovalChange = useCallback(
    (approvalSuccess: boolean) => {
      setApproved(approvalSuccess);
      if (approvalSuccess) refetchAllowance();
    },
    [refetchAllowance]
  );

  function onResetButtonClick() {
    resetRef.current?.reset();
    refetchAllowance();
  }

  function isRedeemAmountValid(): boolean {
    if (!accountShares || !redeemAmount || !vaultBalance) return false;
    if (redeemAmount.lte('0')) return false;
    if (vaultBalance.lte('0')) return false;
    if (redeemAmount.gt(maxRedeemable as BigNumber)) return false;
    if (redeemAmount.gt(accountShares.value)) return false;
    return true;
  }

  function isWithdrawAmountValid(): boolean {
    if (!accountShares || !withdrawAmount || !vaultBalance) return false;
    if (withdrawAmount.lte('0')) return false;
    if (vaultBalance.lte('0')) return false;
    return withdrawAmount.lte((maxWithdrawable as BigNumber) ?? BN_ZERO);
  }

  function isApprovalAmountValid(): boolean {
    if (approvalAmount.eq(BN_ZERO)) return false;
    if ((maxRedeemable as BigNumber).eq(BN_ZERO)) return false;
    let max = maxRedeemable as BigNumber;
    if (isWithdrawMode) max = max.add(1);
    if (approvalAmount.lt(redeemAmount)) return false;
    if (approvalAmount.gt(max)) return false;
    return true;
  }

  return (
    <Section heading="Sell Shares" headingAlign="center">
      <Box textAlign="left">
        {isWithdrawMode && <>Maximum:&nbsp;{numberFormat((maxWithdrawable as BigNumber) ?? BN_ZERO, vault.asset.symbol)}</>}
        {!isWithdrawMode && <>Maximum:&nbsp;{numberFormat((maxRedeemable as BigNumber) ?? BN_ZERO, vault.symbol)}</>}
      </Box>
      <Box mt="1em" textAlign={'left'}>
        <Grid container spacing={1}>
          {isWithdrawMode && (
            <>
              <Grid item xs={6}>
                <AssetAmountTextField
                  label="You receive"
                  symbol={vault.asset.symbol}
                  decimals={vault.asset.decimals}
                  defaultValue={withdrawAmount}
                  maxValue={(maxWithdrawable as BigNumber) ?? BN_ZERO}
                  onChange={onWithdrawInputChange}
                  disabled={txState !== 'idle'}
                ></AssetAmountTextField>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchButtonClick} disabled={txState !== 'idle'}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(redeemAmount, vault.symbol)}</Typography>
              </Grid>
            </>
          )}
          {!isWithdrawMode && (
            <>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(withdrawAmount, vault.asset.symbol)}</Typography>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchButtonClick} disabled={txState !== 'idle'}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <AssetAmountTextField
                  label="You sell"
                  symbol={vault.symbol}
                  decimals={vault.decimals}
                  defaultValue={redeemAmount}
                  maxValue={(maxRedeemable as BigNumber) ?? BN_ZERO}
                  onChange={onRedeemInputChange}
                  disabled={txState !== 'idle'}
                ></AssetAmountTextField>
              </Grid>
            </>
          )}
          <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
            <ApproveButton
              txConfig={approveConfig}
              allowance={allowance}
              amountNeeded={approvalAmount}
              onChange={onApprovalChange}
              disabled={!isWriteSettled(txState) && !isApprovalAmountValid()}
            ></ApproveButton>
          </Grid>
          <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
            {isWithdrawMode ? (
              <SendTxButton
                txConfig={withdrawTxConfig}
                disabled={!isApproved || !isWithdrawAmountValid()}
                onStateChange={onTxStateChange}
                ref={resetRef}
              >
                <>Sell Shares</>
              </SendTxButton>
            ) : (
              <SendTxButton
                txConfig={redeemTxConfig}
                disabled={!isApproved || !isRedeemAmountValid()}
                onStateChange={onTxStateChange}
                ref={resetRef}
              >
                <>Sell Shares</>
              </SendTxButton>
            )}
          </Grid>
          <Grid item xs={isWriteSettled(txState) ? 2 : 0} display={isWriteSettled(txState) ? 'inherit' : 'none'}>
            <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => onResetButtonClick()}>
              <RestartAltOutlined />
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Section>
  );
}

export default BuyShares;
