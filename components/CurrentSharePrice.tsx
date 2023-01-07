import { numberFormat } from '../lib/formats';
import { Vault } from '../lib/vault';
import Section from './Section';

export type CurrentSharePriceProps = {
  vault: Vault;
};

export default function CurrentSharePrice(props: CurrentSharePriceProps) {
  return (
    <Section heading="Current Share Price">
      {numberFormat(props.vault.sharePrice, props.vault.asset.symbol)}
    </Section>
  );
}
