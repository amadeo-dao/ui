import { CalculateOutlined, RestartAltOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useContractRead, usePrepareContractWrite } from 'wagmi';
import { BN_1E, BN_ZERO } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import { isWriteSettled, TxState } from '../../lib/TxState';
import Section from '../displays/Section';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';

function SharePriceManagement() {
  const resetRef = useRef<SendTxButtonRef>(null);
  const { vault, refetch: refetchVault } = useVault();
  const [assets, setAssets] = useState<BigNumber | null>(null);
  const [currentAIU, setCurrentAIU] = useState<BigNumber>(BN_ZERO); // (AIU = Assets in Use)
  const [txState, setTxState] = useState<TxState>('idle');

  const { data: assetsInUseData } = useContractRead({
    address: vault.address,
    abi: vaultABI,
    functionName: 'assetsInUse',
    watch: true
  });

  const { config: txConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'setAssetsInUse',
    args: [assets],
    enabled: true
  });

  useEffect(() => {
    setCurrentAIU((assetsInUseData as BigNumber) ?? BN_ZERO);
  }, [assetsInUseData]);

  const onTxStateChange = useCallback(
    (newState: TxState) => {
      setTxState(newState);
      if (newState === 'success' || newState === 'error') refetchVault();
    },
    [refetchVault]
  );

  function onResetButtonClick() {
    resetRef.current?.reset();
  }

  function isValueValid(): boolean {
    if (!assets) return false;
    if (assets.lt('0')) return false;
    return true;
  }

  function newSharePrice() {
    if (!isValueValid()) return vault.sharePrice;
    if (!assets) return vault.sharePrice;
    if (vault.totalSupply.eq('0')) return BN_1E(vault.asset.decimals);
    const newTotalAssets = vault.assetsUnderManagement.sub(currentAIU).add(assets);
    if (newTotalAssets.eq('0')) return BN_1E(vault.asset.decimals);
    return newTotalAssets.mul(BN_1E(vault.asset.decimals)).div(vault.totalSupply);
  }

  return (
    <Section heading="Share Price And Asset Composition">
      <Box mt="1em" textAlign={'left'}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <AssetAmountTextField
              label="Assets in Use"
              onChange={setAssets}
              symbol={vault.asset.symbol}
              decimals={vault.asset.decimals}
              defaultValue={currentAIU}
              disabled={txState !== 'idle'}
            ></AssetAmountTextField>
          </Grid>
          <Grid item xs={3}>
            <SendTxButton
              ref={resetRef}
              txConfig={txConfig}
              disabled={!isValueValid()}
              onStateChange={onTxStateChange}
              icon={<CalculateOutlined />}
            >
              Set Assets in Use
            </SendTxButton>
          </Grid>
          <Grid item xs={isWriteSettled(txState) ? 2 : 0} display={isWriteSettled(txState) ? 'inherit' : 'none'}>
            <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => onResetButtonClick()}>
              <RestartAltOutlined />
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} mt={'1em'}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body1">Current Assets in Use:</Typography>
                </TableCell>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }} align={'right'}>
                  <Typography variant="body1">{numberFormat(currentAIU, vault.asset.symbol)}</Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body1">New Assets in Use:</Typography>
                </TableCell>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }} align={'right'}>
                  <Typography variant="body1">{assets ? numberFormat(assets, vault.asset.symbol) : <i>invalid value</i>}</Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body1">
                    {!assets ? (
                      <></>
                    ) : assets.gte(currentAIU) ? (
                      <Box color={'green'} component={'span'}>
                        <b>Gain</b>
                      </Box>
                    ) : (
                      <Box color={'red'} component={'span'}>
                        <b>Loss</b>
                      </Box>
                    )}
                  </Typography>
                </TableCell>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }} align={'right'}>
                  <Typography variant="body1">
                    {!assets || assets.lt('0') ? (
                      <i>invalid value</i>
                    ) : assets && assets.sub(currentAIU).eq('0') ? (
                      <i>unchanged</i>
                    ) : (
                      numberFormat(assets.sub(currentAIU), vault.asset.symbol)
                    )}
                  </Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body1">New Share Price:</Typography>
                </TableCell>
                <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }} align={'right'}>
                  <Typography variant="body1">{numberFormat(newSharePrice(), vault.asset.symbol)}</Typography>
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Grid>
      </Box>
    </Section>
  );
}

export default SharePriceManagement;
