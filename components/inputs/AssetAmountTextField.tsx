import { Button, FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils.js';
import React, { useEffect, useMemo, useState } from 'react';

export type AssetAmountTextFieldProps = {
  symbol: string;
  label: string;
  disabled?: boolean;
  decimals?: number;
  defaultValue?: BigNumberish;
  maxValue?: BigNumberish;
  id?: string;
  onChange: (newValue: BigNumber | null) => void;
};

function AssetAmountTextField(props: AssetAmountTextFieldProps) {
  const [value, setValue] = useState<string>(props.defaultValue ? formatValue(props.defaultValue) : '');

  const id = useMemo(() => {
    if (props.id && props.id.length > 0) return props.id;
    return 'asset-amount-input-field-' + Math.floor(Math.random() * 1000);
  }, [props.id]);

  function formatValue(value?: BigNumberish | null): string {
    return formatUnits(value ?? '0', props.decimals ?? 18);
  }

  function parseValue(value: string): BigNumber | null {
    try {
      return parseUnits(value, props.decimals ?? 18);
    } catch (e) {
      return null;
    }
  }

  useEffect(() => {
    props.onChange(parseValue(value));
  }, [value]);

  function onValueChange(newValue: string) {
    setValue(newValue);
  }

  function onMaxButtonClick() {
    if (props.maxValue) setValue(formatValue(props.maxValue));
  }

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor={id}>{props.label}</InputLabel>
      <OutlinedInput
        id={id}
        size="small"
        label={props.label}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        color={!!parseValue(value) ? 'info' : 'error'}
        disabled={!!props.disabled}
        endAdornment={
          <InputAdornment position="end">
            <>
              {props.maxValue && (
                <Button variant="text" size="small" disableRipple disabled={!!props.disabled} onClick={onMaxButtonClick}>
                  Max
                </Button>
              )}
              {props.symbol}
            </>
          </InputAdornment>
        }
      ></OutlinedInput>
    </FormControl>
  );
}

export default AssetAmountTextField;
