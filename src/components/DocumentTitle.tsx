import { useEffect } from 'react';
import { useVault } from '../lib/hooks/useVault';

function DocumentTitle() {
  const { vault } = useVault();
  const { name } = vault;
  useEffect(() => {
    document.title = name;
  }, [name]);

  return <></>;
}

export default DocumentTitle;
