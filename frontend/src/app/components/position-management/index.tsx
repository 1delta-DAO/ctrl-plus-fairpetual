import { FC, useEffect, useState } from 'react'

import { FaDownLong } from 'react-icons/fa6'

import { useManagePosition } from '@/app/hooks/useManagePosition'
import { useWalletBalance } from '@/app/hooks/useWalletBalance'
import { Button } from '@/components/ui/button'
import LeverageSlider from '@/components/ui/leverageSlider'
import Separator from '@/components/ui/separator'
import { Switcher, SwitcherButton } from '@/components/ui/switcher'
import { AZERO } from '@/utils/constants'
import { formatDollarAmount, formatWithDecimals } from '@/utils/formatters'
import { Market } from '@/utils/types'

import InputBox from './input-box'

interface PositionManagementProps {
  markets: Market[] | undefined
  depositBalances: { [key: string]: number } | undefined
  entryPrices: { [key: string]: string } | undefined
  fetchPositions: () => Promise<void>
  fetchDepositBalances: () => Promise<void>
  getLiquidationPrice: (marketAddress: string, leverage: number, isLong: boolean) => Promise<any>
  fetchMarketsPrice: () => Promise<void>
}

const PositionManagement: FC<PositionManagementProps> = ({
  markets,
  depositBalances,
  entryPrices,
  fetchPositions,
  fetchDepositBalances,
  getLiquidationPrice,
  fetchMarketsPrice,
}) => {
  const [isLong, setIsLong] = useState(true)
  const [leverage, setLeverage] = useState<number>(1)

  const LongOrShortLabel = isLong ? 'Long' : 'Short'

  const [assetIn, setAssetIn] = useState<Market | undefined>(undefined)
  const [assetOut, setAssetOut] = useState<Market | undefined>(undefined)
  const [assetInAmount, setAssetInAmount] = useState<string>('')
  const [assetOutAmount, setAssetOutAmount] = useState<string>('')
  const [walletBalanceAssetIn, setWalletBalanceAssetIn] = useState<string>('')
  const [walletBalanceAssetOut, setWalletBalanceAssetOut] = useState<string>('')
  const [poolIsEmpty, setPoolIsEmpty] = useState<boolean>(false)
  const [entryPrice, setEntryPrice] = useState<string | number>('')
  const [liqPrice, setLiqPrice] = useState<string | number>('')
  const [collateralUsd, setCollateralUsd] = useState<string | number>('')
  const [sizeUsd, setSizeUsd] = useState<string | number>('')

  useEffect(() => {
    if (!markets?.length) return
    setAssetIn(AZERO)
    setAssetOut(markets[1] ?? markets[0])
    fetchDepositBalances()
  }, [markets])

  const { openPositionWithNative } = useManagePosition({ marketAddress: assetOut?.address ?? '' })
  const { getNativeBalance, getPSP22Balance } = useWalletBalance()

  const longOrShort = assetIn === AZERO ? openPositionWithNative : null

  const handleLongOrShort = async () => {
    if (longOrShort && assetIn) {
      await longOrShort({
        amount: parseFloat(assetInAmount) * 10 ** assetIn?.decimals,
        leverage: leverage,
        isLong,
      })
      await fetchPositions()
      setAssetInAmount('')
      setLeverage(1)
    }
  }

  const getWalletBalanceAssetIn = assetIn === AZERO ? getNativeBalance : getPSP22Balance
  const getWalletBalanceAssetOut = assetOut === AZERO ? getNativeBalance : getPSP22Balance

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!getWalletBalanceAssetIn || !assetIn) return
      const balance = await getWalletBalanceAssetIn(assetIn)
      setWalletBalanceAssetIn(balance || '0')
    }
    fetchWalletBalance()
  }, [assetIn, getWalletBalanceAssetIn])

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!getWalletBalanceAssetOut || !assetOut) return
      const balance = await getWalletBalanceAssetOut(assetOut)
      setWalletBalanceAssetOut(balance || '0')
    }
    fetchWalletBalance()
  }, [assetOut, getWalletBalanceAssetOut])

  useEffect(() => {
    const setAmountOutAndFetchPrices = async () => {
      if (!assetInAmount || !assetOut || !leverage) {
        setAssetOutAmount('')
        return
      }
      const amount = parseFloat(assetInAmount) * leverage
      setAssetOutAmount(amount.toString())
      // const liqPrice = await getLiquidationPrice(assetOut.address, leverage, isLong)

      // TODO: LIQUIDATION PRICE IS HARDCODED AS getLiquidationPrice IS NOT WORKING
      const liqThreshold = 0.6 // -60% price change from entry price, so -60% if long, +60% if short
      const entryPrice = formatWithDecimals(entryPrices?.[assetOut?.address ?? ''] || '', 6)
      setEntryPrice(entryPrice.toFixed(5))
      const liqPrice = isLong
        ? entryPrice - entryPrice * (liqThreshold / leverage)
        : entryPrice + entryPrice * (liqThreshold / leverage)

      setLiqPrice(liqPrice.toFixed(5))
      const collateralUsd = parseFloat(assetInAmount) * entryPrice
      setCollateralUsd(formatDollarAmount(collateralUsd))
      const sizeUsd = parseFloat(assetOutAmount) * entryPrice
      setSizeUsd(formatDollarAmount(sizeUsd))
    }
    setAmountOutAndFetchPrices()
  }, [assetInAmount, leverage, entryPrices, isLong])

  useEffect(() => {
    assetInAmount && fetchMarketsPrice()
  }, [assetInAmount])

  const tradeIsEnabled = assetInAmount && !poolIsEmpty

  useEffect(() => {
    if (!depositBalances) return
    setPoolIsEmpty(depositBalances[assetOut?.address ?? ''] === 0)
  }, [depositBalances])

  return (
    <div className="flex w-full flex-col gap-4 rounded bg-violet-950 p-4">
      <Switcher>
        <SwitcherButton active={isLong} onClick={() => setIsLong(true)}>
          Long
        </SwitcherButton>
        <SwitcherButton active={!isLong} onClick={() => setIsLong(false)}>
          Short
        </SwitcherButton>
      </Switcher>

      <div className="flex flex-col">
        <InputBox
          topLeftLabel="Pay"
          selectedAssetSymbol={assetIn?.symbol ?? ''}
          markets={markets}
          inputAmount={assetInAmount}
          walletBalance={walletBalanceAssetIn}
          setInputAmount={setAssetInAmount}
          onSetAsset={setAssetIn}
        />
        <div className="z-10 m-auto mb-[-0.75em] mt-[-0.75em] flex justify-center rounded-full bg-violet-600 p-2">
          <FaDownLong size="20px" />
        </div>
        <InputBox
          topLeftLabel={LongOrShortLabel}
          topRightLabel={<></>}
          selectedAssetSymbol={assetOut?.symbol ?? ''}
          markets={markets}
          inputAmount={assetOutAmount}
          walletBalance={walletBalanceAssetOut}
          setInputAmount={setAssetOutAmount}
          onSetAsset={setAssetOut}
          enableInput={false}
        />
      </div>

      {assetInAmount ? <LeverageSlider leverage={leverage} setLeverage={setLeverage} /> : <></>}

      {assetInAmount && (
        <>
          <Separator />
          <div>
            <div>
              <span className="text-[0.95em]">Leverage</span>
              <span className="float-right text-[0.95em]">{leverage}x</span>
            </div>
            <div>
              <span className="text-[0.95em]">Entry Price</span>
              <span className="float-right text-[0.95em]">{entryPrice}</span>
            </div>
            <div>
              <span className="text-[0.95em]">Liq. Price</span>
              <span className="float-right text-[0.95em]">{liqPrice}</span>
            </div>
            <div>
              <span className="text-[0.95em]">You are paying</span>
              <span className="float-right text-[0.95em]">{collateralUsd}</span>
            </div>
            <div>
              <span className="text-[0.95em]">Size</span>
              <span className="float-right text-[0.95em]">{sizeUsd}</span>
            </div>
          </div>
        </>
      )}

      <Button className="rounded-[0.35em]" onClick={handleLongOrShort} disabled={!tradeIsEnabled}>
        <span className="text-[1.1em] font-bold">
          {tradeIsEnabled
            ? LongOrShortLabel
            : poolIsEmpty
              ? `${assetOut?.symbol || 'The'} pool is empty`
              : 'Enter an amount'}
        </span>
      </Button>
    </div>
  )
}

export default PositionManagement
