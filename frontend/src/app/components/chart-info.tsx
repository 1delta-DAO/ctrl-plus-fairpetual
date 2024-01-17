import Image from 'next/image'
import { FC } from 'react'

import { formatDollarAmount, formatPercentage } from '@/utils/formatters'

interface ChartInfoProps {
  ChartInfo: {
    price: number
    change24: number
  }
}

const ChartInfo: FC<ChartInfoProps> = ({ ChartInfo }) => {
  const { price, change24 } = ChartInfo

  return (
    <div className="flex w-full items-center gap-14 rounded-[0.35em] bg-violet-800 p-3">
      <div className="flex items-center gap-2 rounded-[0.35em] bg-violet-600 px-4 py-2 text-xl font-bold">
        <Image
          src="https://avatars.githubusercontent.com/u/54438045?s=200&v=4"
          width={20}
          height={20}
          className="rounded-full"
          alt="Asset Icon"
        />
        <span>AZERO / USD</span>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm leading-none text-gray-400">Price</div>
        <div className="leading-none">{formatDollarAmount(price)}</div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-sm leading-none text-gray-400">24h Change</div>
        <div className="leading-none">{formatPercentage(change24)}</div>
      </div>
    </div>
  )
}

export default ChartInfo
