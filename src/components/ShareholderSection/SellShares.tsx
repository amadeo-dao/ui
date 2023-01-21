import { useState } from 'react';
import Section from '../displays/Section';
import RedeemForm from './RedeemForm';
import WithdrawForm from './WithdrawForm';

function SellShares() {
  const [isWithdrawMode, setWithdrawMode] = useState<boolean>(false);

  function handleSwitchMode() {
    setWithdrawMode(!isWithdrawMode);
  }
  return (
    <Section heading="Sell Shares" headingAlign="center">
      {!isWithdrawMode && <RedeemForm onSwitchMode={handleSwitchMode}></RedeemForm>}
      {isWithdrawMode && <WithdrawForm onSwitchMode={handleSwitchMode}></WithdrawForm>}
    </Section>
  );
}

export default SellShares;
