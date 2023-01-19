import { useState } from 'react';
import Section from '../displays/Section';
import DepositForm from './DepositForm';
import MintForm from './MintForm';

function BuyShares() {
  const [isDepositMode, setDepositMode] = useState<boolean>(true);

  function handleSwitchMode() {
    setDepositMode(!isDepositMode);
  }
  return (
    <Section heading="Buy Shares" headingAlign="center">
      {isDepositMode && <DepositForm onSwitchMode={handleSwitchMode}></DepositForm>}
      {!isDepositMode && <MintForm onSwitchMode={handleSwitchMode}></MintForm>}
    </Section>
  );
}

export default BuyShares;
