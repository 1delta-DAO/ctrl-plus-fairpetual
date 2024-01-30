import { FC, useEffect, useState } from 'react'

import { FaDownLong } from 'react-icons/fa6'

import { useManagePosition } from '@/app/hooks/useManagePosition'
import { useWalletBalance } from '@/app/hooks/useWalletBalance'
import { Button } from '@/components/ui/button'
import LeverageSlider from '@/components/ui/leverageSlider'
import Separator from '@/components/ui/separator'
import { Switcher, SwitcherButton } from '@/components/ui/switcher'
import { AZERO } from '@/utils/constants'
import { Market } from '@/utils/types'

import InputBox from './input-box'

interface PositionManagementProps {
  markets: Market[] | undefined
  depositBalances: { [key: string]: number } | undefined
  fetchPositions: () => Promise<void>
  fetchDepositBalances: () => Promise<void>
}

const PositionManagement: FC<PositionManagementProps> = ({
  markets,
  depositBalances,
  fetchPositions,
  fetchDepositBalances,
}) => {
  const [long, setLong] = useState(true)
  const [leverage, setLeverage] = useState<number>(1)

  const LongOrShortLabel = long ? 'Long' : 'Short'

  const [assetIn, setAssetIn] = useState<Market | undefined>(undefined)
  const [assetOut, setAssetOut] = useState<Market | undefined>(undefined)
  const [assetInAmount, setAssetInAmount] = useState<string>('')
  const [assetOutAmount, setAssetOutAmount] = useState<string>('')
  const [walletBalanceAssetIn, setWalletBalanceAssetIn] = useState<string>('')
  const [walletBalanceAssetOut, setWalletBalanceAssetOut] = useState<string>('')
  const [poolIsEmpty, setPoolIsEmpty] = useState<boolean>(false)

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
        isLong: long,
      })
      await fetchPositions()
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
    if (!assetInAmount) {
      setAssetOutAmount('')
      return
    }
    const amount = parseFloat(assetInAmount) * leverage
    setAssetOutAmount(amount.toString())
  }, [assetInAmount, leverage])

  const tradeIsEnabled = assetInAmount && !poolIsEmpty

  useEffect(() => {
    if (!depositBalances) return
    setPoolIsEmpty(depositBalances[assetOut?.address ?? ''] === 0)
  }, [depositBalances])

  return (
    <div className="flex w-full flex-col gap-4 rounded bg-violet-950 p-4">
      <Switcher>
        <SwitcherButton active={long} onClick={() => setLong(true)}>
          Long
        </SwitcherButton>
        <SwitcherButton active={!long} onClick={() => setLong(false)}>
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
          selectedAssetSymbol={assetOut?.symbol ?? ''}
          markets={markets}
          inputAmount={assetOutAmount}
          walletBalance={walletBalanceAssetOut}
          setInputAmount={setAssetOutAmount}
          onSetAsset={setAssetOut}
          enableInput={false}
        />
      </div>

      <LeverageSlider leverage={leverage} setLeverage={setLeverage} />

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
              <span className="float-right text-[0.95em]">-</span>
            </div>
            <div>
              <span className="text-[0.95em]">Liq. Price</span>
              <span className="float-right text-[0.95em]">-</span>
            </div>
          </div>
        </>
      )}

      {/* <Separator /> */}

      {/* <div>
        <div>
          <span className="text-[0.95em]">Fees and Price Impact</span>
          <span className="float-right text-[0.95em]">-</span>
        </div>
      </div> */}

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
