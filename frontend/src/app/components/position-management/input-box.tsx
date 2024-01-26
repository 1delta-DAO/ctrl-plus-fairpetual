import Image from 'next/image'
import { FC } from 'react'

import { FaChevronDown } from 'react-icons/fa6'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SymbolsToAssets } from '@/utils/exampleData'
import { Asset } from '@/utils/types'

interface InputBoxProps {
  topLeftLabel: string
  assets: Asset[]
  selectedAssetSymbol: string
  onSetAsset: (asset: Asset) => void
}

const InputBox: FC<InputBoxProps> = ({ topLeftLabel, assets, selectedAssetSymbol, onSetAsset }) => {
  const asset = SymbolsToAssets[selectedAssetSymbol]

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
        <div className="flex min-h-[40px] w-1/2 items-center justify-end gap-2">
          <span className="text-2xl">{selectedAssetSymbol}</span>
          <Image
            src={asset.icon}
            width={23}
            height={23}
            className="rounded-full"
            alt="Asset Icon"
          />
          {assets.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-transparent p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <FaChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {assets.map((asset) => (
                  <DropdownMenuItem
                    key={asset.symbol}
                    className={
                      asset.symbol === selectedAssetSymbol
                        ? 'pointer-events-none cursor-not-allowed bg-gray-700 opacity-70'
                        : 'pointer-events-auto cursor-pointer opacity-100'
                    }
                    onClick={() => onSetAsset(asset)}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={asset.icon}
                        width={23}
                        height={23}
                        className="rounded-full"
                        alt="Asset Icon"
                      />
                      <span>{asset.symbol}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}

export default InputBox
