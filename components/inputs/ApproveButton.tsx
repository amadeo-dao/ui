import React, { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { Button, CircularProgress } from '@mui/material';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { CheckOutlined, ErrorOutlined } from '@mui/icons-material';

enum State {
  Enabled,
  Disabled,
  Error,
  Loading,
  Success
}

export type ApproveButtonProps = {
  amountNeeded?: BigNumber | null;
  allowance?: BigNumber;
  txConfig: any;
  disabled?: boolean;
  onChange?: (approvalState: boolean) => void;
};

function ApproveButton(props: ApproveButtonProps) {
  const [state, setState] = useState<State>(State.Disabled);

  const { data: txResponse, write, isIdle, isSuccess, isLoading, isError, error } = useContractWrite(props.txConfig);

  useWaitForTransaction({
    hash: txResponse?.hash,
    onError: () => setState(State.Error),
    onSuccess: (data) => {
      if (data.confirmations >= 1) setState(State.Success);
      props.onChange?.(true);
    }
  });

  useEffect(() => {
    if (!props.txConfig) setState(State.Disabled);
  }, [props.txConfig]);

  useEffect(() => {
    if (!props.amountNeeded || props.amountNeeded.lte('0')) setState(State.Disabled);
    else if (!props.allowance) setState(State.Disabled);
    else if (props.allowance.gte(props.amountNeeded)) setState(State.Success);
    else setState(State.Enabled);
  }, [props.allowance, props.amountNeeded]);

  useEffect(() => {
    if (isLoading) setState(State.Loading);
    else if (isSuccess) setState(State.Loading);
    else if (isError) {
      if (error?.toString().startsWith('UserRejected')) setState(State.Enabled);
      else setState(State.Error);
    }
  }, [isLoading, isIdle, isError, isSuccess, error]);

  useEffect(() => {
    props.onChange?.(state === State.Success);
  }, [state]);

  function onButtonClick() {
    write?.();
  }

  if (state === State.Error)
    return (
      <Button variant="contained" color={'error'} fullWidth disabled startIcon={<ErrorOutlined color={'error'} />}>
        Approve
      </Button>
    );

  if (state === State.Disabled)
    return (
      <Button variant="contained" color={'primary'} fullWidth disabled>
        Approve
      </Button>
    );

  if (state === State.Loading)
    return (
      <Button
        variant="contained"
        color={'primary'}
        fullWidth
        disableElevation
        startIcon={<CircularProgress size={16} color={'inherit'} />}
        sx={{ cursor: 'default' }}
      >
        Approve
      </Button>
    );

  if (state === State.Success)
    return (
      <Button
        variant="contained"
        color={'success'}
        fullWidth
        disableElevation
        disableRipple
        startIcon={<CheckOutlined color="inherit" />}
        sx={{ cursor: 'default' }}
      >
        Approve
      </Button>
    );

  if (state === State.Enabled) {
    return (
      <Button variant="contained" color={'primary'} disabled={props.disabled} fullWidth onClick={onButtonClick}>
        Approve
      </Button>
    );
  }
  return <></>;
}

export default ApproveButton;
