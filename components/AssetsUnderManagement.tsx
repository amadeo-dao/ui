import { numberFormat } from '../lib/formats';
import { useVault } from '../lib/hooks/useVault';
import Section from './Section';

export default function AssetsUnderManagement() {
  const { vault } = useVault();
  return <Section heading="Assets Under Management">{numberFormat(vault.assetsUnderManagement, vault.asset.symbol)}</Section>;
}
