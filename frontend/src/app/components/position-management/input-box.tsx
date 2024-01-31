import Image from 'next/image'
import React, { FC } from 'react'

import { FaChevronDown } from 'react-icons/fa6'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SymbolsToIcons } from '@/utils/constants'
import { Market } from '@/utils/types'

interface InputBoxProps {
  topLeftLabel: string
  topRightLabel?: React.ReactNode
  markets: Market[] | undefined
  selectedAssetSymbol: string
  inputAmount: string
  walletBalance: string | number
  enableInput?: boolean
  customSymbol?: string
  setInputAmount: (value: string) => void
  onSetAsset: (market: Market) => void
}

const InputBox: FC<InputBoxProps> = ({
  topLeftLabel,
  topRightLabel,
  markets,
  selectedAssetSymbol,
  inputAmount,
  walletBalance,
  enableInput = true,
  customSymbol,
  setInputAmount,
  onSetAsset,
}) => {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[0.35em] bg-violet-800 p-4">
      <div className="flex w-full justify-between text-sm text-gray-300">
        <span>{topLeftLabel}</span>
        {topRightLabel ?? (
          <div>
            <span>Wallet Balance: </span>
            <span className="font-bold">{walletBalance}</span>
          </div>
        )}
      </div>
      <div className="flex w-full justify-between">
        <input
          className="w-full rounded-[0.35em] bg-transparent text-2xl focus:outline-none"
          placeholder="0.00"
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          disabled={!enableInput}
          style={
            !enableInput
              ? {
                  cursor: 'not-allowed',
                }
              : {}
          }
        />
        <div className="flex min-h-[40px] w-1/2 items-center justify-end gap-2">
          <span className="text-2xl">{customSymbol ?? selectedAssetSymbol}</span>
          <Image
            src={SymbolsToIcons[selectedAssetSymbol ?? '']}
            width={23}
            height={23}
            className="rounded-full"
            alt="Asset Icon"
          />
          {markets?.length && markets.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-transparent p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <FaChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {markets.map((market) => (
                  <DropdownMenuItem
                    key={market.symbol}
                    className={
                      market.symbol === selectedAssetSymbol
                        ? 'pointer-events-none cursor-not-allowed bg-gray-700 opacity-70'
                        : 'pointer-events-auto cursor-pointer opacity-100'
                    }
                    onClick={() => onSetAsset(market)}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={SymbolsToIcons[market.symbol]}
                        width={23}
                        height={23}
                        className="rounded-full"
                        alt="Asset Icon"
                      />
                      <span>{market.symbol}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default InputBox
