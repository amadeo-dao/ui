import { CalculateOutlined, RestartAltOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import { BigNumber } from 'ethers';
import React, { useRef, useState } from 'react';
import { usePrepareContractWrite } from 'wagmi';
import { BN_1E } from '../../lib/constants';
import { numberFormat } from '../../lib/formats';
import { useVault, vaultABI } from '../../lib/hooks/useVault';
import { TxState } from '../../lib/TxState';
import Section from '../displays/Section';
import AssetAmountTextField from '../inputs/AssetAmountTextField';
import SendTxButton, { SendTxButtonRef } from '../inputs/SendTxButton';

function SharePriceManagement() {
  const resetRef = useRef<SendTxButtonRef>(null);
  const { vault, refetch: refetchVault } = useVault();
  const [assets, setAssets] = useState<BigNumber | null>(null);
  const [txState, setTxState] = useState<TxState>('Idle');

  const { config: txConfig } = usePrepareContractWrite({
    address: vault.address,
    abi: vaultABI,
    functionName: 'setAssetsInUse',
    args: [assets],
    enabled: true
  });

  function onAssetsValueChange(newValue: BigNumber | null) {
    setAssets(newValue);
  }

  function onTxStateChange(newState: TxState) {
    setTxState(newState);
    if (newState === 'Success' || newState === 'Error') refetchVault();
  }

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
    const newTotalAssets = vault.assetsUnderManagement.sub(vault.assetsInUse).add(assets);
    if (newTotalAssets.eq('0')) return BN_1E(vault.asset.decimals);
    return newTotalAssets.mul(BN_1E(vault.asset.decimals)).div(vault.totalSupply);
  }

  function isWriteSettled(): boolean {
    return txState === 'Success' || txState === 'Error';
  }

  return (
    <Section heading="Share Price And Asset Composition">
      <Box mt="1em" textAlign={'left'}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <AssetAmountTextField
              label="Assets in Use"
              onChange={onAssetsValueChange}
              symbol={vault.asset.symbol}
              decimals={vault.asset.decimals}
              defaultValue={vault.assetsInUse}
              disabled={txState === 'Loading'}
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
          <Grid item xs={isWriteSettled() ? 2 : 0} display={isWriteSettled() ? 'inherit' : 'none'}>
            <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => onResetButtonClick()}>
              <RestartAltOutlined />
            </Button>
          </Grid>
        </Grid>
        {assets && (
          <Grid item xs={12} mt={'1em'}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body1">Current Assets in Use:</Typography>
                  </TableCell>
                  <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }} align={'right'}>
                    <Typography variant="body1">{numberFormat(vault.assetsInUse, vault.asset.symbol)}</Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body1">New Assets in Use:</Typography>
                  </TableCell>
                  <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }} align={'right'}>
                    <Typography variant="body1">{numberFormat(assets, vault.asset.symbol)}</Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell width={'1%'} sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body1">
                      {assets.gte(vault.assetsInUse) ? (
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
                      {assets.sub(vault.assetsInUse).eq('0') ? (
                        <i>unchanged</i>
                      ) : (
                        numberFormat(assets.sub(vault.assetsInUse), vault.asset.symbol)
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
        )}
      </Box>
    </Section>
  );
}

export default SharePriceManagement;
