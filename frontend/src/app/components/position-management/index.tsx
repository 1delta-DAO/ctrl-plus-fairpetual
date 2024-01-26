import { FC, useState } from 'react'

import { EuiRangeProps } from '@elastic/eui'
import { FaDownLong } from 'react-icons/fa6'

import { Button } from '@/components/ui/button'
import LeverageSlider from '@/components/ui/leverageSlider'
import Separator from '@/components/ui/separator'
import { Switcher, SwitcherButton } from '@/components/ui/switcher'
import { AZERO, BTC } from '@/utils/exampleData'

import InputBox from './input-box'

const PositionManagement: FC = () => {
  const [long, setLong] = useState(true)
  const [leverage, setLeverage] = useState<EuiRangeProps['value']>('2')

  const LongOrShortLabel = long ? 'Long' : 'Short'

  const assets = [AZERO, BTC]
  const [assetIn, setAssetIn] = useState(assets[0])
  const [assetOut, setAssetOut] = useState(assets[1])

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
          selectedAssetSymbol={assetIn.symbol}
          assets={assets}
          onSetAsset={setAssetIn}
        />
        <div className="z-10 m-auto mb-[-0.75em] mt-[-0.75em] flex justify-center rounded-full bg-violet-600 p-2">
          <FaDownLong size="20px" />
        </div>
        <InputBox
          topLeftLabel={LongOrShortLabel}
          selectedAssetSymbol={assetOut.symbol}
          assets={assets}
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
