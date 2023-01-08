import { useContext } from 'react';
import { numberFormat } from '../lib/formats';
import VaultContext from '../lib/hooks/useVault';
import Section from './Section';

export default function CurrentSharePrice() {
  const vault = useContext(VaultContext);
  return (
    <Section heading="Current Share Price">
      {numberFormat(vault.sharePrice, vault.asset.symbol)}
    </Section>
  );
}
