import { CheckOutlined, ErrorOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { erc20ABI, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { ADDR_BLACKHOLE, BN_ZERO } from '../../lib/constants';
import EvmAddress from '../../lib/evmAddress';

export type Erc20ApproveButtonProps = {
  amountNeeded: BigNumber;
  disabled?: boolean;
  label?: string;
  onAllowanceChange?: (allowance: BigNumber) => void;
  token: EvmAddress;
  spender: EvmAddress;
};

function Erc20ApproveButton({ amountNeeded, disabled, label, onAllowanceChange, spender, token }: Erc20ApproveButtonProps) {
  label = label || 'Approve';
  const [allowance, setAllowance] = useState<BigNumber>(BN_ZERO);

  const { address: owner } = useAccount();

  const isActive = !!owner && !!amountNeeded && !!spender;

  const { data: allowanceData, refetch: refetchAllowanceData } = useContractRead({
    address: isActive ? token : undefined,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [owner ?? ADDR_BLACKHOLE, spender],
    watch: true
  });

  const { config: txConfig } = usePrepareContractWrite({
    address: isActive ? token : undefined,
    abi: erc20ABI,
    functionName: 'approve',
    args: [spender, amountNeeded]
  });

  const { data: txResponse, status: txState, error: txError, write: writeTx, reset: resetTx } = useContractWrite(txConfig);

  useWaitForTransaction({
    hash: txResponse?.hash,
    onSuccess: (data) => {
      if (data.confirmations >= 1) {
        refetchAllowanceData();
      }
    }
  });

  useEffect(() => {
    const newAllowance = allowanceData ?? BN_ZERO;
    if (newAllowance.eq(allowance)) return;
    setAllowance(newAllowance);
    onAllowanceChange?.(newAllowance);
  }, [allowance, allowanceData, onAllowanceChange]);

  useEffect(() => {
    if (amountNeeded.eq(allowance)) return;
    resetTx?.();
  }, [allowance, amountNeeded, resetTx]);

  useEffect(() => {
    if (!txError) return;
    if (txError.toString().startsWith('UserRejected')) resetTx();
  }, [txError, resetTx]);

  const onButtonClick = useCallback(() => {
    writeTx?.();
  }, [writeTx]);

  if (!isAmountValid(amountNeeded))
    return (
      <Button variant="contained" color={'primary'} fullWidth disabled>
        {label}
      </Button>
    );

  if (allowance.gte(amountNeeded))
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
        {label}
      </Button>
    );

  if (txState === 'error')
    return (
      <Button variant="contained" color={'error'} fullWidth disabled startIcon={<ErrorOutlined color={'error'} />}>
        {label}
      </Button>
    );

  if (txState === 'idle') {
    return (
      <Button variant="contained" color={'primary'} disabled={disabled} fullWidth onClick={onButtonClick}>
        {label}
      </Button>
    );
  }
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
}

function isAmountValid(amount: BigNumber) {
  return amount.gt('0');
}

export default Erc20ApproveButton;
