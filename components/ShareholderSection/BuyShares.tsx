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

/*


    <Box mt="1em" textAlign={'left'}>
      <Grid container spacing={1}>
        {isDepositMode && (
          <>
            <Grid item xs={6}>
              <AssetAmountTextField
                label="You pay"
                symbol={vault.asset.symbol}
                decimals={vault.asset.decimals}
                defaultValue={depositAmount}
                maxValue={balance}
                onChange={onChangeDepositInputValue}
                disabled={txState === 'loading' || isWriteSettled(txState)}
              ></AssetAmountTextField>
            </Grid>
            <Grid item xs={2} textAlign={'center'}>
              <Button variant="text" disableRipple onClick={onSwitchButtonClick}>
                <SwapHorizOutlined></SwapHorizOutlined>
              </Button>
            </Grid>
            <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
              <Typography variant="body1">{numberFormat(mintAmount, vault.symbol)}</Typography>
            </Grid>
          </>
        )}
        {!isDepositMode && (
          <>
            <Grid item xs={4} marginTop={'0.5em'} textAlign={'center'}>
              <Typography variant="body1">{numberFormat(depositAmount, vault.asset.symbol)}</Typography>
            </Grid>
            <Grid item xs={2} textAlign={'center'}>
              <Button variant="text" disableRipple onClick={onSwitchButtonClick}>
                <SwapHorizOutlined></SwapHorizOutlined>
              </Button>
            </Grid>
            <Grid item xs={6}>
              <AssetAmountTextField
                label="You buy"
                symbol={vault.symbol}
                decimals={vault.decimals}
                defaultValue={mintAmount}
                maxValue={maxMintAmount}
                onChange={onChangeMintInputValue}
                disabled={txState === 'loading' || isWriteSettled(txState)}
              ></AssetAmountTextField>
            </Grid>
          </>
        )}
        <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
          <ApproveButton
            txConfig={approveConfig}
            allowance={allowance}
            amountNeeded={approvalAmount}
            onChange={onApprovalChange}
            disabled={!isWriteSettled(txState) && !isAssetAmountValid()}
          ></ApproveButton>
        </Grid>
        <Grid item xs={isWriteSettled(txState) ? 5 : 6}>
          <SendTxButton
            txConfig={isDepositMode ? depositTxConfig : mintTxConfig}
            disabled={!isAssetAmountValid() || !isApproved}
            onStateChange={onTxStateChange}
            ref={resetRef}
          >
            <>Buy Shares</>
          </SendTxButton>
        </Grid>
        <Grid item xs={isWriteSettled(txState) ? 2 : 0} display={isWriteSettled(txState) ? 'inherit' : 'none'}>
          <Button aria-label="Reset Form" variant="contained" color={'error'} onClick={() => onResetButtonClick()}>
            <RestartAltOutlined />
          </Button>
        </Grid>
      </Grid>
    </Box>
    */
