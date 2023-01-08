import { useContext } from 'react';
import { numberFormat } from '../lib/formats';
import VaultContext from '../lib/hooks/useVault';
import Section from './Section';

export default function AssetsUnderManagement() {
  const vault = useContext(VaultContext);
  return (
    <Section heading="Assets Under Management">
      {numberFormat(vault.assetsUnderManagement, vault.asset.symbol)}
    </Section>
  );
}
