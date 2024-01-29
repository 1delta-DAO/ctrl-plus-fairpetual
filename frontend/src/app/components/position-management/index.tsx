import { FC, useEffect, useState } from 'react'

import { EuiRangeProps } from '@elastic/eui'
import { FaDownLong } from 'react-icons/fa6'

import { Button } from '@/components/ui/button'
import LeverageSlider from '@/components/ui/leverageSlider'
import Separator from '@/components/ui/separator'
import { Switcher, SwitcherButton } from '@/components/ui/switcher'
import { AZERO } from '@/utils/constants'
import { Market } from '@/utils/types'

import InputBox from './input-box'

interface PositionManagementProps {
  markets: Market[] | undefined
}

const PositionManagement: FC<PositionManagementProps> = ({ markets }) => {
  const [long, setLong] = useState(true)
  const [leverage, setLeverage] = useState<EuiRangeProps['value']>('2')

  const LongOrShortLabel = long ? 'Long' : 'Short'

  const [assetIn, setAssetIn] = useState<Market | undefined>(undefined)
  const [assetOut, setAssetOut] = useState<Market | undefined>(undefined)
  const [assetInAmount, setAssetInAmount] = useState<string>('')
  const [assetOutAmount, setAssetOutAmount] = useState<string>('')

  useEffect(() => {
    if (!markets?.length) return
    setAssetIn(AZERO)
    setAssetOut(markets[1] ?? markets[0])
  }, [markets])

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
          amount={assetInAmount}
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
          amount={assetOutAmount}
          setInputAmount={setAssetOutAmount}
          onSetAsset={setAssetOut}
        />
      </div>

      <LeverageSlider leverage={leverage} setLeverage={setLeverage} />

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

      <Separator />

      <div>
        <div>
          <span className="text-[0.95em]">Fees and Price Impact</span>
          <span className="float-right text-[0.95em]">-</span>
        </div>
      </div>

      <Button className="rounded-[0.35em]">
        <span className="text-[1.1em] font-bold">{LongOrShortLabel}</span>
      </Button>
    </div>
  )
}

export default PositionManagement
