import { BigNumber, BigNumberish } from 'ethers';

export function numberFormat(
  value?: BigNumberish,
  currency?: string,
  precision = 2
): string {
  value = value ? BigNumber.from(value) : BigNumber.from('0');
  currency = currency ?? 'Unknown';
  let right = value.mod(BigNumber.from('10').pow(18)).toString();
  right = right.padStart(18, '0').substring(0, 2);
  let left = value.div(BigNumber.from('10').pow(18)).toString();
  const currencyValue = Number.parseFloat(left + '.' + right);
  return (
    Intl.NumberFormat('en-US', { minimumFractionDigits: precision }).format(
      currencyValue
    ) +
    ' ' +
    currency
  );
}
