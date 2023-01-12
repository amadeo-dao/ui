import { RestartAltOutlined } from '@mui/icons-material';
import { Button, Grid } from '@mui/material';
import { BigNumber, BigNumberish } from 'ethers';
import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { erc20ABI, useAccount, useContractRead, usePrepareContractWrite } from 'wagmi';
import { BN_ZERO } from '../../lib/constants';
import { ERC20 } from '../../lib/erc20';
import EvmAddress from '../../lib/evmAddress';
import ApproveButton from './ApproveButton';
import AssetAmountTextField from './AssetAmountTextField';
import SendTxButton, { SendTxButtonRef, TxState } from './SendTxButton';

export type SendTokensWithApprovalFormProps = {
  defaultValue?: BigNumberish;
  maxValue?: BigNumberish;
  asset: ERC20;
  recipient: EvmAddress;
  writeConfig: any;
  onSubmitValueChange: (submitValue: BigNumber | null) => void;
  onApprovalChange: (approved: boolean) => void;
};
function SendTokensWithApprovalForm(props: SendTokensWithApprovalFormProps) {
  const resetRef = useRef<SendTxButtonRef>(null);
  const [value, setValue] = useState<BigNumber | null>(null);
  const [txState, setTxState] = useState<TxState>();
  const [isApproved, setApproved] = useState<boolean>(false);

  const { address: owner } = useAccount();
  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    address: props.asset.address,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [owner ?? '0x0', props.recipient],
    enabled: !!owner
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: props.asset.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [props.recipient, value ?? BN_ZERO],
    enabled: !!value && value.gt('0')
  });

  useEffect(() => {
    props.onSubmitValueChange(value);
  }, [value]);

  useEffect(() => {
    props.onApprovalChange(isApproved);
  }, [isApproved]);

  function onValueChange(newValue: BigNumber | null) {
    setValue(newValue);
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
    refetchAllowance();
  }

  function isWriteSettled() {
    return txState === 'Success' || txState === 'Error';
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form onSubmit={onSubmit}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <AssetAmountTextField
            symbol={props.asset.symbol}
            decimals={props.asset.decimals}
            maxValue={props.maxValue}
            onChange={onValueChange}
            defaultValue={props.defaultValue}
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
          <SendTxButton txConfig={props.writeConfig} disabled={!isApproved} onStateChange={onTxStateChange} ref={resetRef}>
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
  );
}

export default SendTokensWithApprovalForm;
