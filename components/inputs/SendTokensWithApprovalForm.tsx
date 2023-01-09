import { RestartAltOutlined, SendOutlined } from '@mui/icons-material';
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
import React, { ChangeEvent, useEffect, useState } from 'react';
import {
  erc20ABI,
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useSendTransaction
} from 'wagmi';
import { ERC20 } from '../../lib/erc20';
import EvmAddress from '../../lib/evmAddress';
import ApproveButton from './ApproveButton';

export type SendTokensWithApprovalFormProps = {
  defaultValue?: BigNumberish;
  maxValue?: BigNumberish;
  asset: ERC20;
  recipient: EvmAddress;
};
function SendTokensWithApprovalForm(props: SendTokensWithApprovalFormProps) {
  const [submitValue, setSubmitValue] = useState<BigNumber | null>(null);
  const [value, setValue] = useState<string>(
    formatFormValue(props.defaultValue)
  );
  const { address: owner } = useAccount();

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

  useEffect(() => {
    setSubmitValue(parseFormValue(value));
  }, [value]);

  function onValueChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setValue(e.target.value);
  }

  function onMaxButtonClick() {
    if (props.maxValue) setValue(formatFormValue(props.maxValue));
  }

  function onApprovalChange(isApproved: boolean) {
    console.log('Approved: ' + isApproved);
  }

  return (
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
            endAdornment={
              <InputAdornment position="end">
                <Button
                  variant="text"
                  size="small"
                  disableRipple
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
      <Grid item xs={5}>
        <ApproveButton
          owner={owner}
          amountNeeded={submitValue}
          spender={props.recipient}
          token={props.asset.address}
          setState={onApprovalChange}
        ></ApproveButton>
      </Grid>
      <Grid item xs={5}>
        <Button
          variant="contained"
          disabled
          color={'primary'}
          fullWidth
          startIcon={<SendOutlined />}
        >
          Return Funds
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained" color={'error'}>
          <RestartAltOutlined />
        </Button>
      </Grid>
    </Grid>
  );
}

export default SendTokensWithApprovalForm;
