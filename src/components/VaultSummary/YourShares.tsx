import { Box } from '@mui/material';
import { BigNumber } from 'ethers';
import { useAccount, useContractRead } from 'wagmi';
import { BN_1E, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import Section from '../displays/Section';

function YourShares() {
  const { vault } = useVault();
  const { address: account } = useAccount();
  const { address: vaultAddress } = vault;
  const { data: balance } = useContractRead({
    address: account ? vaultAddress : undefined,
    abi: vaultABI,
    functionName: 'balanceOf',
    args: [account],
    watch: true
  }) as { data: BigNumber };
  const { symbol, decimals } = vault;
  return (
    <Section heading="Your Shares">
      <Box>
        <Box mr={'0.3em'}>{numberFormat(balance ?? BN_ZERO, symbol, 2, decimals)}</Box>
        {
          <Box fontSize={'0.8em'}>
            (
            {numberFormat(
              !balance || vault.totalSupply.isZero() ? BN_ZERO : balance.mul(BN_1E(decimals + 2)).div(vault.totalSupply),
              '%',
              2,
              decimals
            )}
            )
          </Box>
        }
      </Box>
    </Section>
  );
}

export default YourShares;
