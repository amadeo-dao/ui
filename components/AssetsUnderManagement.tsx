import { numberFormat } from '../lib/formats';
import { Vault } from '../lib/vault';
import Section from './Section';

export type AssetsUnderManagementProps = {
  vault: Vault;
};

export default function AssetsUnderManagement(
  props: AssetsUnderManagementProps
) {
  return (
    <Section heading="Assets Under Management">
      {numberFormat(
        props.vault.assetsUnderManagement,
        props.vault.asset.symbol
      )}
    </Section>
  );
}
