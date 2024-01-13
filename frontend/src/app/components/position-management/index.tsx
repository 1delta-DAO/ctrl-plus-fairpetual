import LeverageSlider from "@/components/ui/leverageSlider";
import { EuiRangeProps } from "@elastic/eui";
import { FC, useState } from "react";
import { FaDownLong } from "react-icons/fa6";
import InputBox from "./input-box";

const PositionManagement: FC = () => {

  const [long, setLong] = useState(true)
  const [leverage, setLeverage] = useState<EuiRangeProps['value']>('2');

  const longShortCommon = 'rounded-[0.35em] py-2 w-full text-center transition-all'
  const longShortActive = 'bg-violet-600'
  const longShortInactive = 'text-gray-400 cursor-pointer hover:bg-violet-700'

  const longShortCss = (long: boolean) => {
    if (long) {
      return longShortCommon + ' ' + longShortActive
    } else {
      return longShortCommon + ' ' + longShortInactive
    }
  } 

  return (
    <div className='flex flex-col gap-4 p-4 rounded w-full bg-violet-950'>

      <div className='rounded-[0.35em] flex p-2 w-full bg-violet-800'>
        <div className={longShortCss(long)} onClick={() => setLong(true)}>
          Long
        </div>
        <div className={longShortCss(!long)} onClick={() => setLong(false)}>
          Short
        </div>
      </div>

      <div className='flex flex-col'>
        <InputBox topLeftLabel='Pay' asset='AZERO'/>
        <div className="flex justify-center rounded-full bg-violet-600 m-auto p-2 mt-[-0.75em] mb-[-0.75em] z-10">
          <FaDownLong size="20px"/>
        </div>
        <InputBox topLeftLabel={long ? 'Long' : 'Short'} asset='BTC'/>
      </div>

      <LeverageSlider leverage={leverage} setLeverage={setLeverage} />

    </div>
  )
}

export default PositionManagement
