import { RestartAltOutlined, SendOutlined } from '@mui/icons-material';
import {
  Box,
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
import React, { ChangeEvent, useState } from 'react';
import { ERC20 } from '../../lib/erc20';

export type SendTokensWithApprovalFormProps = {
  defaultValue?: BigNumberish;
  maxValue?: BigNumberish;
  asset: ERC20;
};
function SendTokensWithApprovalForm(props: SendTokensWithApprovalFormProps) {
  const [submitValue, setSubmitValue] = useState<BigNumber | null>(null);
  const [value, setValue] = useState<string>(
    formatFormValue(props.defaultValue)
  );

  function onValueChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setValue(e.target.value);
    setSubmitValue(parseFormValue(e.target.value));
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
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel htmlFor="return-assets-input">
            Assets to send to Vault
          </InputLabel>
          <OutlinedInput
            id="return-assets-input"
            size="small"
            defaultValue="0"
            label="Assets to send to Vault"
            value={value}
            onChange={(e) => onValueChange(e)}
            color={!!submitValue ? 'info' : 'error'}
            endAdornment={
              <InputAdornment position="end">
                <Button variant="text" size="small" disableRipple>
                  Max
                </Button>
                {props.asset.symbol}
              </InputAdornment>
            }
          ></OutlinedInput>
        </FormControl>
      </Grid>
      <Grid item xs={5}>
        <Button
          variant="contained"
          color={'success'}
          fullWidth
          disableRipple
          startIcon={<CircularProgress size={16} color={'inherit'} />}
        >
          Approve
        </Button>
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
