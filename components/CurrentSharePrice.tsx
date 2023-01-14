import { numberFormat } from '../lib/formats';
import { useVault } from '../lib/hooks/useVault';
import Section from './Section';

export default function CurrentSharePrice() {
  const { vault } = useVault();
  return <Section heading="Current Share Price">{numberFormat(vault.sharePrice, vault.asset.symbol)}</Section>;
}
