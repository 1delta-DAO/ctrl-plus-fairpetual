import { FC, useState } from 'react'

import { EuiRangeProps } from '@elastic/eui'
import { FaDownLong } from 'react-icons/fa6'

import { Button } from '@/components/ui/button'
import LeverageSlider from '@/components/ui/leverageSlider'
import Separator from '@/components/ui/separator'
import { AZERO, BTC } from '@/utils/exampleData'

import InputBox from './input-box'

const PositionManagement: FC = () => {
  const [long, setLong] = useState(true)
  const [leverage, setLeverage] = useState<EuiRangeProps['value']>('2')

  const longShortCommon = 'rounded-[0.35em] py-2 w-full text-center transition-all'
  const longShortActive = 'bg-violet-600 font-bold'
  const longShortInactive = 'text-gray-400 cursor-pointer hover:bg-violet-700'

  const longShortCss = (long: boolean) => {
    if (long) {
      return longShortCommon + ' ' + longShortActive
    } else {
      return longShortCommon + ' ' + longShortInactive
    }
  }

  const LongOrShortLabel = long ? 'Long' : 'Short'

  return (
    <div className="flex w-full flex-col gap-4 rounded bg-violet-950 p-4">
      <div className="flex w-full rounded-[0.35em] bg-violet-800 p-2">
        <div className={longShortCss(long)} onClick={() => setLong(true)}>
          Long
        </div>
        <div className={longShortCss(!long)} onClick={() => setLong(false)}>
          Short
        </div>
      </div>

      <div className="flex flex-col">
        <InputBox topLeftLabel="Pay" asset={AZERO} />
        <div className="z-10 m-auto mb-[-0.75em] mt-[-0.75em] flex justify-center rounded-full bg-violet-600 p-2">
          <FaDownLong size="20px" />
        </div>
        <InputBox topLeftLabel={LongOrShortLabel} asset={BTC} />
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
