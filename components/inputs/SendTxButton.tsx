import { CheckOutlined, ErrorOutlined, SendOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import React, { ForwardedRef, PropsWithChildren, ReactElement, useEffect, useImperativeHandle, useState } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { TxState } from '../../lib/TxState';

export type SendTxButtonProps = {
  txConfig: any;
  disabled?: boolean;
  onStateChange?: (newState: TxState) => void;
  icon?: ReactElement;
};

export type SendTxButtonRef = {
  reset: () => void;
};

export const SendTxButton = React.forwardRef<SendTxButtonRef, PropsWithChildren<SendTxButtonProps>>(
  (props: React.PropsWithChildren<SendTxButtonProps>, ref: ForwardedRef<SendTxButtonRef>) => {
    const [state, setState] = useState<TxState>('Idle');
    const [icon] = useState<ReactElement | undefined>(props.icon);

    useImperativeHandle(ref, () => ({
      reset() {
        reset?.();
      }
    }));

    const { data: response, write, error, reset, isLoading, isError, isIdle, isSuccess } = useContractWrite(props.txConfig);

    const { data: txReceipt } = useWaitForTransaction({
      hash: response?.hash,
      onError: () => {
        setState('Error');
      }
    });

    useEffect(() => {
      if (isError) {
        if (error?.toString().startsWith('UserRejected')) setState('Idle');
        else setState('Error');
      } else if (isLoading) setState('Loading');
      else if (isSuccess) {
        if (txReceipt) {
          if (txReceipt.confirmations === 0) setState('Loading');
          else if (txReceipt.confirmations >= 1) {
            setState('Success');
          }
        }
      } else if (isIdle) {
        setState('Idle');
      }
    }, [isError, isLoading, isIdle, isSuccess, txReceipt, error]);

    useEffect(() => {
      props.onStateChange?.(state);
    }, [state, props.onStateChange]);

    function onButtonClick() {
      if (props.disabled) return;
      write?.();
    }

    return (
      <Button
        variant="contained"
        disabled={props.disabled}
        color={state === 'Success' ? 'success' : 'primary'}
        fullWidth
        onClick={() => onButtonClick()}
        disableElevation={state !== 'Idle'}
        disableRipple={state !== 'Idle'}
        startIcon={
          state === 'Loading' ? (
            <CircularProgress size={16} color={'inherit'} />
          ) : state === 'Success' ? (
            <CheckOutlined />
          ) : state === 'Error' ? (
            <ErrorOutlined color="error" />
          ) : (
            icon ?? <></>
          )
        }
        sx={{
          cursor: state === 'Idle' ? 'pointer' : 'default'
        }}
      >
        {props.children}
      </Button>
    );
  }
);

SendTxButton.displayName = 'SendTxButton';

export default SendTxButton;
