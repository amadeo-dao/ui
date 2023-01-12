import vaultAbi from '../../lib/vault.abi.json';

import { Box, Skeleton } from '@mui/material';

import { useContext, useState } from 'react';
import { useAccount, useBalance, usePrepareContractWrite } from 'wagmi';
import { numberFormat } from '../../lib/formats';
import VaultContext from '../../lib/hooks/useVault';
import Section from '../Section';
import SendTokensWithApprovalForm from '../inputs/SendTokensWithApprovalForm';
import { BN_ZERO } from '../../lib/constants';
import { BigNumber } from 'ethers';

function ReturnFunds() {
  const vault = useContext(VaultContext);
  const [submitValue, setSubmitValue] = useState<BigNumber | null>();
  const [isApproved, setApproved] = useState<boolean>(false);
  const { address } = useAccount();

  const assets = useBalance({
    address,
    token: vault.asset.address,
    watch: true
  });

  const { config: writeConfig } = usePrepareContractWrite({
    address: vault.address,
    functionName: 'returnAssets',
    abi: vaultAbi,
    args: [address ?? '0x0', submitValue ?? BN_ZERO],
    enabled: !!submitValue && isApproved
  });

  function onApprovalChange(newValue: boolean) {
    setApproved(newValue);
  }

  return (
    <Section heading="Return Funds to Vault" headingAlign="center">
      <Box textAlign="left">
        Assets in Wallet:&nbsp;
        {assets?.data ? (
          numberFormat(assets.data.value, assets.data.symbol)
        ) : (
          <Skeleton variant="rectangular" width={'8em'} height={'1em'} />
        )}
      </Box>
      <Box mt="1em" textAlign={'left'}>
        <SendTokensWithApprovalForm
          asset={vault.asset}
          recipient={vault.address}
          maxValue={assets.data?.value}
          defaultValue={BN_ZERO}
          writeConfig={writeConfig}
          onSubmitValueChange={setSubmitValue}
          onApprovalChange={onApprovalChange}
        ></SendTokensWithApprovalForm>
      </Box>
    </Section>
  );
}

export default ReturnFunds;
