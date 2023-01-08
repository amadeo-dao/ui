import { useContext } from 'react';
import { numberFormat } from '../lib/formats';
import VaultContext from '../lib/hooks/useVault';
import Section from './Section';

export default function VaultTotalSupply() {
  const vault = useContext(VaultContext);
  return (
    <Section heading="Total Shares">
      {numberFormat(vault.totalSupply, vault.symbol)}
    </Section>
  );
}
