import { CheckOutlined, ErrorOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { BigNumber } from 'ethers';
import { ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { erc20ABI, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { ADDR_DEADBEEF, BN_ZERO } from '../../lib/constants';
import EvmAddress from '../../lib/evmAddress';
import { TxState } from '../../lib/TxState';

export type Erc20ApproveButtonProps = {
  amountNeeded: BigNumber;
  disabled?: boolean;
  label?: string;
  successLabel?: string;
  onAllowanceChange?: (newAllowance: BigNumber) => void;
  token: EvmAddress;
  spender: EvmAddress;
};

export type Erc20ApproveButtonRef = {
  reset: () => void;
};

const Erc20ApproveButton = forwardRef<Erc20ApproveButtonRef, Erc20ApproveButtonProps>(
  (
    { amountNeeded, disabled, label, onAllowanceChange, spender, successLabel, token }: Erc20ApproveButtonProps,
    ref: ForwardedRef<Erc20ApproveButtonRef>
  ) => {
    useImperativeHandle(ref, () => ({
      reset() {
        setState('idle');
        setIsDone(false);
        resetTx?.();
        setAllowance(BN_ZERO);
        refetchAllowance();
      }
    }));

    label = label || 'Approve';
    successLabel = successLabel || 'Approved';
    const [state, setState] = useState<TxState>('idle');
    const [isDone, setIsDone] = useState<boolean>(false);
    const [allowance, setAllowance] = useState<BigNumber>(BN_ZERO);

    const { address: owner } = useAccount();

    const { refetch: refetchAllowance } = useContractRead({
      address: !!owner && !disabled ? token : undefined,
      abi: erc20ABI,
      functionName: 'allowance',
      args: [owner || ADDR_DEADBEEF, spender],
      onSuccess: (newAllowance) => {
        if (allowance?.eq(newAllowance)) return;
        setAllowance(newAllowance);
      }
    });

    const canWrite = !!owner && !amountNeeded.eq(BN_ZERO) && !disabled;
    const { config: txConfig } = usePrepareContractWrite({
      address: canWrite ? token : undefined,
      abi: erc20ABI,
      functionName: 'approve',
      args: [spender, amountNeeded]
    });

    const { data: txResponse, status: txState, error: txError, write: writeTx, reset: resetTx } = useContractWrite(txConfig);

    useWaitForTransaction({
      hash: txResponse?.hash,
      onSuccess: (data) => {
        if (data.confirmations === 0) setState('loading');
        if (data.confirmations >= 1) {
          setState('success');
          setIsDone(true);
          refetchAllowance();
        }
      }
    });

    useEffect(() => {
      setIsDone(false);
    }, [amountNeeded]);

    useEffect(() => {
      onAllowanceChange?.(allowance);
    }, [allowance, onAllowanceChange]);

    useEffect(() => {
      if (isDone) return;
      const isApproved = amountNeeded.gt(BN_ZERO) && allowance.gte(amountNeeded);
      if (isApproved) setState('success');
      else setState('idle');
    }, [allowance, amountNeeded, isDone]);

    useEffect(() => {
      if (txState === 'success') setState('loading');
      else setState(txState);
    }, [txState]);

    useEffect(() => {
      if (!txError) return;
      if (txError.toString().startsWith('UserRejected')) resetTx();
    }, [txError, resetTx]);

    const onButtonClick = useCallback(() => {
      writeTx?.();
    }, [writeTx]);
    if (isDone || state === 'success')
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
          {successLabel}
        </Button>
      );
    else if (disabled || amountNeeded.lte('0'))
      return (
        <Button variant="contained" color={'primary'} fullWidth disabled>
          {label}
        </Button>
      );
    else if (state === 'error')
      return (
        <Button variant="contained" color={'error'} fullWidth disabled startIcon={<ErrorOutlined color={'error'} />}>
          {label}
        </Button>
      );
    else if (state === 'idle') {
      return (
        <Button variant="contained" color={'primary'} disabled={disabled} fullWidth onClick={onButtonClick}>
          {label}
        </Button>
      );
    } else if (state === 'loading')
      return (
        <Button
          variant="contained"
          color={'primary'}
          fullWidth
          disableElevation
          startIcon={<CircularProgress size={16} color={'inherit'} />}
          sx={{ cursor: 'default' }}
        >
          {label}
        </Button>
      );
    else return <>Unknown state... {state}</>;
  }
);

Erc20ApproveButton.displayName = 'Erc20ApproveButton';

export default Erc20ApproveButton;
