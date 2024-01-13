import { formatDollarAmount, formatPercentage } from "@/utils/formatters"
import { FC } from "react"

interface ChartInfoProps {
  ChartInfo: {
    price: number
    change24: number
  }
}

const ChartInfo: FC<ChartInfoProps> = ({ ChartInfo }) => {

  const { price, change24 } = ChartInfo

  return (
    <div className='flex gap-14 items-center w-full bg-violet-800 p-3 rounded-[0.35em]'>
      <div className='flex font-bold text-xl items-center gap-2'>
        <img src="https://avatars.githubusercontent.com/u/54438045?s=200&v=4" width="20px" className="rounded-full"/>
        <span>AZERO / USD</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-400 leading-none">
          Price
        </div>
        <div className="leading-none">
          {formatDollarAmount(price)}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm text-gray-400 leading-none">
          24h Change
        </div>
        <div className="leading-none">
          {formatPercentage(change24)}
        </div>
      </div>
    </div>
  )
}

export default ChartInfo
