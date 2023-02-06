import { Box } from '@mui/material';
import { BigNumber } from 'ethers';
import { useAccount, useContractRead } from 'wagmi';
import { BN_1E } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import Section from '../displays/Section';

export default function YourAssets() {
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
  const shareValue = balance?.mul(vault.sharePrice).div(BN_1E(vault.decimals));
  return (
    <Section heading="Your Share Value">
      <Box>
        <Box component={'div'} mr={'0.3em'}>
          {numberFormat(shareValue, vault.asset.symbol, 2, vault.asset.decimals)}
        </Box>
        <Box component={'div'} fontSize="0.8em">
          (Total Assets: {numberFormat(vault.assetsUnderManagement, vault.asset.symbol, 2, vault.asset.decimals)})
        </Box>
      </Box>
    </Section>
  );
}
