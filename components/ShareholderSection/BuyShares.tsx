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
  const [balance, setBalance] = useState<BigNumber>(BN_ZERO);
  const [approvalAmount, setApprovalAmount] = useState<BigNumber>(BN_ZERO);
  const [depositAmount, setDepositAmount] = useState<BigNumber>(BN_ZERO);
  const [mintAmount, setMintAmount] = useState<BigNumber>(BN_ZERO);
  const [maxMintAmount, setMaxMintAmount] = useState<BigNumber>(BN_ZERO);
  const [txState, setTxState] = useState<TxState>('idle');
  const [isApproved, setApproved] = useState<boolean>(false);

  const [isDepositMode, setDepositMode] = useState<boolean>(true);

  const { address: account } = useAccount();

  const { vault, refetch: refetchVault, convertToAssets, convertToShares } = useVault();

  const { data: balanceData } = useBalance({
    address: account,
    token: vault.asset.address,
    watch: true
  });

  const { value: balanceValue } = balanceData || { value: BN_ZERO };

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: vault.asset.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [account ?? ADDR_DEADBEEF, vault.address],
    enabled: !!account
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: vault.asset.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [vault.address, approvalAmount]
  });

  const { config: depositTxConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'deposit',
    args: [depositAmount ?? BN_ZERO, account ?? ADDR_DEADBEEF]
  });

  const { config: mintTxConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'mint',
    args: [mintAmount ?? BN_ZERO, account ?? ADDR_DEADBEEF]
  });

  useEffect(() => {
    if (balanceValue.eq(balance)) return;
    console.log('Balance');
    setBalance(balanceValue);
  }, [balance, balanceValue]);

  useEffect(() => {
    if (balance.eq(BN_ZERO)) setMaxMintAmount(BN_ZERO);
    else setMaxMintAmount(convertToShares(balance));
  }, [balance, convertToShares]);

  useEffect(() => {
    if (!allowance || !approvalAmount || approvalAmount.eq(BN_ZERO)) setApproved(false);
    else setApproved(allowance.gte(approvalAmount));
  }, [allowance, approvalAmount]);

  const onApprovalChange = useCallback(
    (approvalSuccess: boolean) => {
      setApproved(approvalSuccess);
      if (approvalSuccess) refetchAllowance();
    },
    [refetchAllowance]
  );

  const onChangeDepositInputValue = useCallback(
    (newValue: BigNumber | null) => {
      setDepositAmount(newValue ?? BN_ZERO);
      setApprovalAmount(newValue ?? BN_ZERO);
      setMintAmount(convertToShares(newValue ?? BN_ZERO));
    },
    [convertToShares]
  );

  const onChangeMintInputValue = useCallback(
    (newValue: BigNumber | null) => {
      console.log('onChangeMintInputValue');
      setDepositAmount(convertToAssets(newValue ?? BN_ZERO));
      setApprovalAmount(newValue && newValue.gt(BN_ZERO) ? convertToAssets(newValue).add(1) : BN_ZERO);
      setMintAmount(newValue ?? BN_ZERO);
    },
    [convertToAssets]
  );

  const onTxStateChange = useCallback(
    (newState: TxState) => {
      setTxState(newState);
      if (newState === 'success') {
        refetchVault();
      }
    },
    [refetchVault]
  );

  function onSwitchButtonClick() {
    setDepositMode(!isDepositMode);
  }

  function onResetButtonClick() {
    resetRef.current?.reset();
    refetchAllowance();
  }

  function isAssetAmountValid(): boolean {
    return !!depositAmount && balance.gt('0') && depositAmount.lte(balance);
  }

  return (
    <Section heading="Buy Shares" headingAlign="center">
      <Box textAlign="left">
        Assets in Wallet:&nbsp;
        {numberFormat(balance, vault.asset.symbol)}
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
                  defaultValue={depositAmount}
                  maxValue={balance}
                  onChange={onChangeDepositInputValue}
                  disabled={txState === 'loading' || isWriteSettled(txState)}
                ></AssetAmountTextField>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchButtonClick}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(mintAmount, vault.symbol)}</Typography>
              </Grid>
            </>
          )}
          {!isDepositMode && (
            <>
              <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
                <Typography variant="body1">{numberFormat(depositAmount, vault.asset.symbol)}</Typography>
              </Grid>
              <Grid item xs={2} textAlign={'center'}>
                <Button variant="text" disableRipple onClick={onSwitchButtonClick}>
                  <SwapHorizOutlined></SwapHorizOutlined>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <AssetAmountTextField
                  label="You buy"
                  symbol={vault.symbol}
                  decimals={vault.decimals}
                  defaultValue={mintAmount}
                  maxValue={maxMintAmount}
                  onChange={onChangeMintInputValue}
                  disabled={txState === 'loading' || isWriteSettled(txState)}
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
              disabled={!isWriteSettled(txState) && !isAssetAmountValid()}
            ></ApproveButton>
          </Grid>
          <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
            <SendTxButton
              txConfig={isDepositMode ? depositTxConfig : mintTxConfig}
              disabled={!isAssetAmountValid() || !isApproved}
              onStateChange={onTxStateChange}
              ref={resetRef}
            >
              <>Buy Shares</>
            </SendTxButton>
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
