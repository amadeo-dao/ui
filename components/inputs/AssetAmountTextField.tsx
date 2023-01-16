import { Button, FormControl, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { BigNumber, BigNumberish } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils.js';
import { useEffect, useMemo, useState } from 'react';

export type AssetAmountTextFieldProps = {
  symbol: string;
  label: string;
  disabled?: boolean;
  decimals?: number;
  defaultValue?: BigNumberish;
  maxValue?: BigNumberish;
  textFieldId?: string;
  onChange?: (newValue: BigNumber | null) => void;
};

function AssetAmountTextField({
  decimals,
  defaultValue,
  disabled,
  label,
  maxValue,
  onChange,
  symbol,
  textFieldId
}: AssetAmountTextFieldProps) {
  const [value, setValue] = useState<string>(defaultValue ? formatValue(defaultValue) : '');

  const id = useMemo(() => {
    if (textFieldId && textFieldId.length > 0) return textFieldId;
    return 'asset-amount-input-field-' + Math.floor(Math.random() * 1000);
  }, [textFieldId]);

  useEffect(() => {
    onChange?.(parseValue(value, decimals));
  }, [value, decimals, onChange]);

  function onValueChange(newValue: string) {
    setValue(newValue);
  }

  function onMaxButtonClick() {
    if (maxValue) setValue(formatValue(maxValue, decimals));
  }

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        id={id}
        size="small"
        label={label}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        color={!!parseValue(value) ? 'info' : 'error'}
        disabled={!!disabled}
        endAdornment={
          <InputAdornment position="end">
            <>
              {maxValue && (
                <Button variant="text" size="small" disableRipple disabled={!!disabled} onClick={onMaxButtonClick}>
                  Max
                </Button>
              )}
              {symbol}
            </>
          </InputAdornment>
        }
      ></OutlinedInput>
    </FormControl>
  );
}

export default AssetAmountTextField;

function formatValue(value?: BigNumberish | null, decimals?: number): string {
  return formatUnits(value ?? '0', decimals ?? 18);
}

function parseValue(value: string, decimals?: number): BigNumber | null {
  try {
    return parseUnits(value, decimals ?? 18);
  } catch (e) {
    return null;
  }
}
