import Image from 'next/image'
import { FC, useState } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
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
  markets: Market[] | undefined
  selectedAssetSymbol: string
  amount: string
  setAmount: (value: string) => void
  onSetAsset: (market: Market) => void
}

const InputBox: FC<InputBoxProps> = ({
  topLeftLabel,
  markets,
  selectedAssetSymbol,
  amount,
  setAmount,
  onSetAsset,
}) => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const market = markets?.find((market) => market.symbol === selectedAssetSymbol)

  const [balance, setBalance] = useState(0)
  const { activeChain } = useInkathon()

  // useEffect(() => {
  //   const fetchBalance = async () => {
  //     if (api && activeAccount && market) {
  //       let balance: BalanceData | undefined = undefined
  //       if (market.symbol === 'AZERO') {
  //         balance = await getBalance(api, activeAccount.address)
  //       } else {
  //         const psp22balances = await getPSP22Balances(
  //           api,
  //           activeAccount.address,
  //           activeChain?.network || '',
  //         )
  //         console.log(psp22balances)
  //       }
  //     }
  //   }
  //   fetchBalance()
  // }, [market])

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
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex min-h-[40px] w-1/2 items-center justify-end gap-2">
          <span className="text-2xl">{selectedAssetSymbol}</span>
          <Image
            src={SymbolsToIcons[selectedAssetSymbol ?? '']}
            width={23}
            height={23}
            className="rounded-full"
            alt="Asset Icon"
          />
          {markets?.length && markets.length > 1 && (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default InputBox
