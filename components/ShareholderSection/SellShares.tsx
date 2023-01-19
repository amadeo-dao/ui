import { useState } from 'react';
import Section from '../displays/Section';
import RedeemForm from './RedeemForm';

function SellShares() {
  const [isWithdrawMode, setWithdrawMode] = useState<boolean>(true);

  function handleSwitchMode() {
    setWithdrawMode(!isWithdrawMode);
  }
  return (
    <Section heading="Buy Shares" headingAlign="center">
      {isWithdrawMode && <RedeemForm onSwitchMode={handleSwitchMode}></RedeemForm>}
    </Section>
  );
}

export default SellShares;
