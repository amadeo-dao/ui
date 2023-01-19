import { CheckOutlined, ErrorOutlined } from '@mui/icons-material';
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
    const { children, disabled, icon, onStateChange, txConfig } = props as React.PropsWithChildren<SendTxButtonProps>;
    const [state, setState] = useState<TxState>('idle');

    useImperativeHandle(ref, () => ({
      reset() {
        reset?.();
      }
    }));

    const { data: response, write, error, reset, status: txState } = useContractWrite(txConfig);

    useWaitForTransaction({
      hash: response?.hash,
      onSuccess: () => {
        setState('success');
      },
      onError: () => {
        setState('error');
      }
    });

    useEffect(() => {
      if (txState !== 'error') return;
      if (error?.toString().startsWith('UserRejected')) setState('idle');
      else setState('error');
    }, [txState, error]);

    useEffect(() => {
      if (txState === 'success' || txState === 'loading') setState('loading');
      else if (txState === 'idle') setState('idle');
    }, [txState]);

    useEffect(() => {
      onStateChange?.(state);
    }, [state, onStateChange]);

    function onButtonClick() {
      if (disabled) return;
      if (state !== 'idle') return;
      write?.();
    }

    return (
      <Button
        variant="contained"
        disabled={state === 'idle' && disabled}
        color={state === 'success' ? 'success' : 'primary'}
        fullWidth
        onClick={() => onButtonClick()}
        disableElevation={state !== 'idle'}
        disableRipple={state !== 'idle'}
        startIcon={
          state === 'loading' ? (
            <CircularProgress size={16} color={'inherit'} />
          ) : state === 'success' ? (
            <CheckOutlined />
          ) : state === 'error' ? (
            <ErrorOutlined />
          ) : (
            icon ?? <></>
          )
        }
        sx={{
          cursor: state === 'idle' ? 'pointer' : 'default'
        }}
      >
        {children}
      </Button>
    );
  }
);

SendTxButton.displayName = 'SendTxButton';

export default SendTxButton;
