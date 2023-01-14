import { BigNumber, BigNumberish } from 'ethers';

export const BN_ZERO = BigNumber.from('0');
export const BN_ONE = BigNumber.from('1');
export const BN_MAX_UINT = BigNumber.from('115792089237316195423570985008687907853269984665640564039457584007913129639935');

export const BN_1E = (exp: BigNumberish) => BigNumber.from('10').pow(exp);
