import Image from 'next/image'
import { FC } from 'react'

import { Asset } from '@/utils/types'

interface InputBoxProps {
  topLeftLabel: string
  asset: Asset
}

const InputBox: FC<InputBoxProps> = ({ topLeftLabel, asset }) => {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[0.35em] bg-violet-800 p-4">
      <div className="flex w-full justify-between text-sm text-gray-300">
        <span>{topLeftLabel}</span>
        <span>Balance: 0</span>
      </div>
      <div className="flex w-full justify-between">
        <input
          className="w-full rounded-[0.35em] bg-transparent text-2xl focus:outline-none"
          placeholder="0.00"
          type="number"
        />
        <div className="flex w-2/6 items-center justify-end gap-2">
          <span className="text-2xl">{asset.symbol}</span>
          <Image
            src={asset.icon}
            width={23}
            height={23}
            className="rounded-full"
            alt="Asset Icon"
          />
        </div>
      </div>
    </div>
  )
}

export default InputBox
