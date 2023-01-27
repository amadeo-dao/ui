import DocumentTitle from './DocumentTitle';
import MainAppBar from './MainAppBar';
import ManagerSection from './ManagerSection';
import ShareholderSection from './ShareholderSection';
import VaultSummary from './VaultSummary';

function Vault() {
  return (
    <>
      <DocumentTitle></DocumentTitle>
      <MainAppBar></MainAppBar>
      <VaultSummary></VaultSummary>
      <ManagerSection></ManagerSection>
      <ShareholderSection></ShareholderSection>
    </>
  );
}

export default Vault;
