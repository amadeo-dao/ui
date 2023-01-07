import { numberFormat } from '../lib/formats';
import { Vault } from '../lib/vault';
import Section from './Section';

export type VaultTotalSupplyProps = {
  vault: Vault;
};

export default function VaultTotalSupply(props: VaultTotalSupplyProps) {
  return (
    <Section heading="Total Shares">
      {numberFormat(props.vault.totalSupply, props.vault.symbol)}
    </Section>
  );
}
