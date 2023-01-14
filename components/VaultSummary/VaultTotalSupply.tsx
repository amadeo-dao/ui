import { numberFormat } from '../../lib/formats';
import { useVault } from '../../lib/hooks/useVault';
import Section from '../displays/Section';

export default function VaultTotalSupply() {
  const { vault } = useVault();
  return <Section heading="Total Shares">{numberFormat(vault.totalSupply, vault.symbol)}</Section>;
}
