import { CheckOutlined, ErrorOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';

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

function ApproveButton({ allowance, amountNeeded, disabled, txConfig, onChange }: ApproveButtonProps) {
  const [state, setState] = useState<State>(State.Disabled);

  const { data: txResponse, write, status, error } = useContractWrite(txConfig);

  useWaitForTransaction({
    hash: txResponse?.hash,
    onError: () => setState(State.Error),
    onSuccess: (data) => {
      if (data.confirmations >= 1) setState(State.Success);
      onChange?.(true);
    }
  });

  useEffect(() => {
    if (!amountNeeded || amountNeeded.lte('0')) setState(State.Disabled);
    else if (!allowance) setState(State.Disabled);
    else if (allowance.gte(amountNeeded)) setState(State.Success);
    else setState(State.Enabled);
  }, [allowance, amountNeeded]);

  useEffect(() => {
    if (status === 'loading') setState(State.Loading);
    else if (status === 'success') setState(State.Loading);
    else if (status === 'error') {
      if (error?.toString().startsWith('UserRejected')) setState(State.Enabled);
      else setState(State.Error);
    }
  }, [status, error]);

  useEffect(() => {
    onChange?.(state === State.Success);
  }, [state, onChange]);

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
      <Button variant="contained" color={'primary'} disabled={disabled} fullWidth onClick={onButtonClick}>
        Approve
      </Button>
    );
  }

  return <></>;
}

export default ApproveButton;
