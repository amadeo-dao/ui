import {
  CheckOutlined,
  RestartAltOutlined,
  SendOutlined
} from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  OutlinedInput
} from '@mui/material';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils.js';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';
import { ERC20 } from '../../lib/erc20';
import EvmAddress from '../../lib/evmAddress';
import ApproveButton from './ApproveButton';
import { BN_ZERO } from '../../lib/constants';

enum SubmitButtonState {
  Disabled,
  Enabled,
  Loading,
  Success,
  Error
}

export type SendTokensWithApprovalFormProps = {
  defaultValue?: BigNumberish;
  maxValue?: BigNumberish;
  asset: ERC20;
  recipient: EvmAddress;
  writeConfig: any;
  onSubmitValueChange: (submitValue: BigNumber | null) => void;
};
function SendTokensWithApprovalForm(props: SendTokensWithApprovalFormProps) {
  const [submitValue, setSubmitValue] = useState<BigNumber | null>(null);
  const [value, setValue] = useState<string>(
    formatFormValue(props.defaultValue)
  );
  const [submitButtonState, setSubmitButtonState] = useState<SubmitButtonState>(
    SubmitButtonState.Disabled
  );
  const [isApproved, setApproved] = useState<boolean>(false);

  const { address: owner } = useAccount();

  const {
    data: writeResponse,
    write,
    reset: writeReset,
    isLoading: writeLoading,
    isError: writeError
  } = useContractWrite(props.writeConfig);

  const { data: writeReceipt } = useWaitForTransaction({
    hash: writeResponse?.hash
  });

  useEffect(() => {
    props.onSubmitValueChange(submitValue);
  }, [submitValue]);

  useEffect(() => {
    setSubmitValue(parseFormValue(value));
  }, [value]);

  useEffect(() => {
    if (!submitValue || submitValue.lte('0'))
      setSubmitButtonState(SubmitButtonState.Disabled);
    else if (!isApproved) setSubmitButtonState(SubmitButtonState.Disabled);
    else setSubmitButtonState(SubmitButtonState.Enabled);
  }, [isApproved, submitValue]);

  useEffect(() => {
    if (writeLoading) setSubmitButtonState(SubmitButtonState.Loading);
    else if (writeResponse && !writeReceipt)
      setSubmitButtonState(SubmitButtonState.Loading);
    else if (writeReceipt) {
      if (writeReceipt.confirmations > 0) {
        setSubmitButtonState(SubmitButtonState.Success);
        console.log(writeReceipt.confirmations);
      } else setSubmitButtonState(SubmitButtonState.Loading);
    } else {
      setSubmitValue(parseFormValue(value));
    }
  }, [writeLoading, writeReceipt]);

  useEffect(() => {
    if (writeError) setSubmitButtonState(SubmitButtonState.Error);
  }, [writeError]);

  function onValueChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setValue(e.target.value);
  }

  function onMaxButtonClick() {
    if (props.maxValue) setValue(formatFormValue(props.maxValue));
  }

  function onSubmit(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (submitButtonState !== SubmitButtonState.Enabled) return;
    write?.();
  }

  function onResetButtonClick() {
    writeReset?.();
  }

  function isWriteSettled() {
    return (
      submitButtonState === SubmitButtonState.Success ||
      submitButtonState === SubmitButtonState.Error
    );
  }

  function formatFormValue(value?: BigNumberish | null): string {
    return formatUnits(value ?? '0', props.asset.decimals);
  }

  function parseFormValue(value: string): BigNumber | null {
    try {
      return parseUnits(value, props.asset.decimals);
    } catch (e) {
      return null;
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel htmlFor="return-assets-input">
              Assets to send to Vault
            </InputLabel>
            <OutlinedInput
              id="return-assets-input"
              size="small"
              label="Assets to send to Vault"
              value={value}
              onChange={(e) => onValueChange(e)}
              color={!!submitValue ? 'info' : 'error'}
              disabled={submitButtonState === SubmitButtonState.Loading}
              endAdornment={
                <InputAdornment position="end">
                  <Button
                    variant="text"
                    size="small"
                    disableRipple
                    disabled={submitButtonState === SubmitButtonState.Loading}
                    onClick={onMaxButtonClick}
                  >
                    Max
                  </Button>
                  {props.asset.symbol}
                </InputAdornment>
              }
            ></OutlinedInput>
          </FormControl>
        </Grid>
        <Grid item xs={isWriteSettled() ? 5 : 6}>
          <ApproveButton
            owner={owner}
            amountNeeded={submitValue}
            spender={props.recipient}
            token={props.asset.address}
            setState={(success) => setApproved(success)}
          ></ApproveButton>
        </Grid>
        <Grid item xs={isWriteSettled() ? 5 : 6}>
          <Button
            variant="contained"
            disabled={submitButtonState === SubmitButtonState.Disabled}
            color={
              submitButtonState === SubmitButtonState.Success
                ? 'success'
                : 'primary'
            }
            fullWidth
            onClick={() => onSubmit()}
            disableElevation={submitButtonState !== SubmitButtonState.Enabled}
            disableRipple={submitButtonState !== SubmitButtonState.Enabled}
            startIcon={
              submitButtonState === SubmitButtonState.Loading ? (
                <CircularProgress size={16} color={'inherit'} />
              ) : submitButtonState === SubmitButtonState.Success ? (
                <CheckOutlined />
              ) : (
                <SendOutlined />
              )
            }
            sx={{
              cursor:
                submitButtonState === SubmitButtonState.Enabled
                  ? 'pointer'
                  : 'default'
            }}
          >
            Return Funds
          </Button>
        </Grid>
        <Grid
          item
          xs={isWriteSettled() ? 2 : 0}
          display={isWriteSettled() ? 'inherit' : 'none'}
        >
          <Button
            aria-label="Reset Form"
            variant="contained"
            color={'error'}
            onClick={() => onResetButtonClick()}
          >
            <RestartAltOutlined />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default SendTokensWithApprovalForm;
