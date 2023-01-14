import { RestartAltOutlined, SwapHorizOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Skeleton, Typography } from '@mui/material';
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

  const [isDepositMode, setDepositMode] = useState<boolean>(true);

  const { address: account } = useAccount();

  const { vault, refetch: refetchVault } = useVault();

  const { data: balance } = useBalance({
    address: account,
    token: vault.asset.address,
    watch: true
  });

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: vault.asset.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [account ?? '0x0', vault.address],
    enabled: !!account
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: vault.asset.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [vault.address, assetAmount]
  });

  const { config: txConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'deposit',
    args: [assetAmount ?? BN_ZERO, account ?? '0x0'],
    enabled: !!account && isApproved && !!assetAmount && assetAmount.gt(BN_ZERO)
  });

  useEffect(() => {
    if (!allowance || !assetAmount || assetAmount.eq(BN_ZERO)) setApproved(false);
    else setApproved(allowance.gte(assetAmount));
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

  function onSwitchToMintButtonClick() {
    setDepositMode(false);
  }

  function onSwitchToDepositButtonClick() {
    setDepositMode(true);
  }

  function onTxStateChange(newState: TxState) {
    setTxState(newState);
    if (newState === 'Success') {
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
    const sharePrice = BigNumber.from(vault.sharePrice);
    return assets.mul(BN_1E(vault.asset.decimals)).div(sharePrice);
  }

  function convertShares(shares?: BigNumber | null): BigNumber {
    if (!shares || shares.lte('0')) return BN_ZERO;
    const sharePrice = BigNumber.from(vault.sharePrice);
    return shares.mul(sharePrice).div(BN_1E(vault.asset.decimals));
  }

  function isWriteSettled() {
    return txState === 'Success' || txState === 'Error';
  }

  function isAssetAmountValid(): boolean {
    return !!assetAmount && !!balance && balance.value.gt('0') && assetAmount.lte(balance.value);
  }

  return (
    <Section heading="Buy Shares" headingAlign="center">
      <Box textAlign="left">
        Assets in Wallet:&nbsp;
        {balance ? numberFormat(balance.value, balance.symbol) : <Skeleton variant="rectangular" width={'8em'} height={'1em'} />}
      </Box>
      <Box mt="1em" textAlign={'left'}>
        <Grid container spacing={1}>
          {isDepositMode && (
            <>
              <Grid item xs={6}>
                <AssetAmountTextField
                  label="You pay"
                  symbol={vault.asset.symbol}
                  decimals={vault.asset.decimals}
                  defaultValue={assetAmount}
                  maxValue={balance?.value}
                  onChange={onAssetAmountChange}
                ></AssetAmountTextField>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchToMintButtonClick}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(sharesAmount, vault.symbol)}</Typography>
              </Grid>
            </>
          )}
          {!isDepositMode && (
            <>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(assetAmount, vault.asset.symbol)}</Typography>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchToDepositButtonClick}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <AssetAmountTextField
                  label="You buy"
                  symbol={vault.symbol}
                  decimals={vault.decimals}
                  defaultValue={sharesAmount}
                  maxValue={convertAssets(balance?.value)}
                  onChange={onSharesAmountChange}
                ></AssetAmountTextField>
              </Grid>
            </>
          )}
          <Grid item xs={isWriteSettled() ? 5 : 6}>
            <ApproveButton
              txConfig={approveConfig}
              allowance={allowance}
              amountNeeded={assetAmount}
              onChange={(success) => onApprovalChange(success)}
              disabled={!isWriteSettled() && !isAssetAmountValid()}
            ></ApproveButton>
          </Grid>
          <Grid item xs={isWriteSettled() ? 5 : 6}>
            <SendTxButton
              txConfig={txConfig}
              disabled={!isAssetAmountValid() || !isApproved}
              onStateChange={onTxStateChange}
              ref={resetRef}
            >
              <>Buy Shares</>
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
