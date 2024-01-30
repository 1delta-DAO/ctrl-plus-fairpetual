import { useState } from 'react'

import marketAbi from '@/abis/market.json'
import { useContract, useInkathon } from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

interface useManagePositionProps {
  marketAddress: string
}

export const useManagePosition = ({ marketAddress }: useManagePositionProps) => {
  const { api, activeAccount } = useInkathon()
  const { contract: marketContract } = useContract(marketAbi, marketAddress)

  const [openPositionWithNativeIsLoading, setOpenPositionWithNativeIsLoading] =
    useState<boolean>(false)
  const [closePositionIsLoading, setClosePositionIsLoading] = useState<boolean>(false)

  const openPositionWithNative = async ({
    amount,
    leverage,
    isLong,
  }: {
    amount: number
    leverage: number
    isLong: boolean
  }) => {
    if (!activeAccount || !marketContract || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    setOpenPositionWithNativeIsLoading(true)
    try {
      await contractTxWithToast(
        api,
        activeAccount.address,
        marketContract,
        'open_native',
        { value: amount },
        [isLong, leverage],
      )
    } catch (e) {
      console.error(e)
    } finally {
      setOpenPositionWithNativeIsLoading(false)
    }
  }

  const closePosition = async (positionId: string) => {
    if (!activeAccount || !marketContract || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    setClosePositionIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, marketContract, 'close', {}, [
        positionId,
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setClosePositionIsLoading(false)
    }
  }

  return {
    openPositionWithNative,
    closePosition,
    openPositionWithNativeIsLoading,
    closePositionIsLoading,
  }
}
