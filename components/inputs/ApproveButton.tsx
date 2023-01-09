import React, { useEffect, useState } from 'react';
import EvmAddress from '../../lib/evmAddress';
import { BigNumber } from 'ethers';
import { Button, CircularProgress } from '@mui/material';
import {
  erc20ABI,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from 'wagmi';
import { CheckOutlined, ErrorOutlined } from '@mui/icons-material';
import { BN_ZERO } from '../../lib/constants';

export type ApproveButtonProps = {
  owner?: EvmAddress;
  spender: EvmAddress;
  token: EvmAddress;
  amountNeeded?: BigNumber | null;
  approveInfinite?: boolean;
  setState?: (approvalState: boolean) => void;
};

function ApproveButton(props: ApproveButtonProps) {
  const [isError, setError] = useState(false);
  const [isDisabled, setDisabled] = useState(true);
  const [isLoading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);

  const {
    data: allowance,
    isError: allowanceError,
    isLoading: allowanceLoading,
    refetch: refetchAllowance
  } = useContractRead({
    address: props.token,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [props.owner ?? '0x0', props.spender]
  });

  const { config: approveConfig } = usePrepareContractWrite({
    address: props.token,
    abi: erc20ABI,
    functionName: 'approve',
    args: [props.spender, props.amountNeeded ?? BN_ZERO]
  });

  const {
    data: approveResponse,
    write: approveWrite,
    isLoading: approveLoading,
    isError: approveError
  } = useContractWrite(approveConfig);

  const { data: approveTxReceipt } = useWaitForTransaction({
    hash: approveResponse?.hash
  });

  useEffect(() => {
    setError(allowanceError || approveError);
  }, [allowanceError]);

  useEffect(() => {
    setDisabled(
      !props.owner ||
        allowanceLoading ||
        !props.amountNeeded ||
        props.amountNeeded.lte(BigNumber.from('0'))
    );
  }, [props.owner, allowanceLoading, props.amountNeeded]);

  useEffect(() => {
    if (approveLoading) setLoading(true);
    else if (!approveTxReceipt) setLoading(!!approveResponse);
    else {
      setLoading(approveTxReceipt.confirmations < 1);
      setSuccess(approveTxReceipt.confirmations >= 1);
    }
  }, [approveLoading, approveResponse, approveTxReceipt]);

  useEffect(() => {
    if (!props.amountNeeded) setSuccess(false);
    else if (allowance?.gte(props.amountNeeded)) setSuccess(true);
    else setSuccess(false);
  }, [allowance, props.amountNeeded]);

  useEffect(() => {
    props.setState?.(isSuccess);
  }, [isSuccess, props.setState]);

  function onButtonClick() {
    approveWrite?.();
  }

  if (isError)
    return (
      <Button
        variant="contained"
        color={'error'}
        fullWidth
        disabled
        startIcon={<ErrorOutlined color={'error'} />}
      >
        Approve
      </Button>
    );

  if (isDisabled)
    return (
      <Button
        variant="contained"
        color={'primary'}
        fullWidth
        disabled={isDisabled}
      >
        Approve
      </Button>
    );

  if (isLoading)
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

  if (isSuccess)
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

  return (
    <Button
      variant="contained"
      color={'primary'}
      fullWidth
      disabled={isDisabled}
      onClick={onButtonClick}
    >
      Approve
    </Button>
  );
}

export default ApproveButton;
