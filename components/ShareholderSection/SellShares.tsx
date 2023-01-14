import { RestartAltOutlined, SwapHorizOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import React, { useEffect, useRef, useState } from 'react';
import { erc20ABI, useAccount, useBalance, useContractRead, usePrepareContractWrite } from 'wagmi';
import { BN_1E, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import { TxState } from '../../lib/TxState';
import ApproveButton from '../inputs/ApproveButton';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';
import Section from '../displays/Section';

function BuyShares() {
  const resetRef = useRef<SendTxButtonRef>(null);
  const [assetAmount, setAssetAmount] = useState<BigNumber>(BN_ZERO);
  const [sharesAmount, setSharesAmount] = useState<BigNumber>(BN_ZERO);
  const [txState, setTxState] = useState<TxState>('Idle');
  const [isApproved, setApproved] = useState<boolean>(false);

  const [isWithdrawMode, setWithdrawMode] = useState<boolean>(true);

  const { address: account } = useAccount();

  const { vault, refetch: refetchVault } = useVault();

  const { data: vaultBalance } = useBalance({
    address: vault.address,
    token: vault.asset.address,
    watch: true
  });

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

  const { config: approveConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [vault.address, sharesAmount]
  });

  const { config: txConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'redeem',
    args: [sharesAmount ?? BN_ZERO, account ?? '0x0', account ?? '0x0'],
    enabled: !!account && isApproved && !!sharesAmount && sharesAmount.gt(BN_ZERO)
  });

  useEffect(() => {
    if (!allowance || !assetAmount || assetAmount.eq(BN_ZERO)) setApproved(false);
    else setApproved(allowance.gte(sharesAmount));
  }, [allowance]);

  function onAssetAmountChange(newValue: BigNumber | null) {
    setAssetAmount(newValue ?? BN_ZERO);
    setSharesAmount(convertAssets(newValue));
    if (isWriteSettled()) resetRef.current?.reset();
  }

  function onSharesAmountChange(newValue: BigNumber | null) {
    setAssetAmount(convertShares(newValue));
    setSharesAmount(newValue ?? BN_ZERO);
    if (isWriteSettled()) resetRef.current?.reset();
  }

  function onSwitchToBurnButtonClick() {
    setWithdrawMode(false);
  }

  function onSwitchToWithdrawButtonClick() {
    setWithdrawMode(true);
  }

  function onTxStateChange(newState: TxState) {
    setTxState(newState);
    if (isWriteSettled()) {
      refetchVault();
      refetchAllowance();
    }
  }

  function onApprovalChange(approvalSuccess: boolean) {
    setApproved(approvalSuccess);
  }

  function onResetButtonClick() {
    resetRef.current?.reset();
  }

  function convertAssets(assets?: BigNumber | null): BigNumber {
    if (!assets || assets.lte('0')) return BN_ZERO;
    return assets.mul(BN_1E(vault.asset.decimals)).div(vault.sharePrice);
  }

  function convertShares(shares?: BigNumber | null): BigNumber {
    if (!shares || shares.lte('0')) return BN_ZERO;
    return shares.mul(vault.sharePrice).div(BN_1E(vault.asset.decimals));
  }

  function maxBurnable(): BigNumber {
    if (!accountShares || !vaultBalance) return BN_ZERO;
    const vaultBalanceShares = convertShares(vaultBalance.value);
    return vaultBalanceShares.lte(accountShares.value) ? vaultBalanceShares : accountShares.value;
  }

  function isWriteSettled() {
    return txState === 'Success' || txState === 'Error';
  }

  function isSharesAmountValid(): boolean {
    if (!accountShares || !sharesAmount || !vaultBalance) return false;
    if (sharesAmount.lte('0')) return false;
    if (vaultBalance.value.lte('0')) return false;
    return sharesAmount.lte(maxBurnable());
  }
  return (
    <Section heading="Sell Shares" headingAlign="center">
      <Box textAlign="left">
        <>Max. Shares:&nbsp;{numberFormat(maxBurnable(), vault.symbol)}</>
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
                  defaultValue={assetAmount}
                  maxValue={convertShares(maxBurnable())}
                  onChange={onAssetAmountChange}
                ></AssetAmountTextField>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchToBurnButtonClick}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(sharesAmount, vault.symbol)}</Typography>
              </Grid>
            </>
          )}
          {!isWithdrawMode && (
            <>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(assetAmount, vault.asset.symbol)}</Typography>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchToWithdrawButtonClick}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <AssetAmountTextField
                  label="You sell"
                  symbol={vault.symbol}
                  decimals={vault.decimals}
                  defaultValue={sharesAmount}
                  maxValue={maxBurnable()}
                  onChange={onSharesAmountChange}
                ></AssetAmountTextField>
              </Grid>
            </>
          )}
          <Grid item xs={isWriteSettled() ? 5 : 6}>
            <ApproveButton
              txConfig={approveConfig}
              allowance={allowance}
              amountNeeded={sharesAmount}
              onChange={(success) => onApprovalChange(success)}
              disabled={!isWriteSettled() && !isSharesAmountValid()}
            ></ApproveButton>
          </Grid>
          <Grid item xs={isWriteSettled() ? 5 : 6}>
            <SendTxButton
              txConfig={txConfig}
              disabled={!isApproved || !isSharesAmountValid()}
              onStateChange={onTxStateChange}
              ref={resetRef}
            >
              <>Sell Shares</>
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

export default BuyShares;
