'use client'

import { useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { Market } from '@/utils/types'

export const useFetchMarkets = () => {
  const { api } = useInkathon()
  const { contract: managerContract } = useRegisteredContract(ContractIds.Manager)
  const { contract: marketContract } = useRegisteredContract(ContractIds.Market)
  const [marketsAreLoading, setMarketsAreLoading] = useState<boolean>(false)
  const [markets, setMarkets] = useState<Market[]>()

  const fetchMarkets = async () => {
    if (!managerContract || !marketContract || !api) return

    setMarketsAreLoading(true)

    try {
      const result = await contractQuery(api, '', managerContract, 'view_markets')
      const {
        output: marketsAddresses,
        isError,
        decodedOutput,
      } = decodeOutput(result, managerContract, 'view_markets')
      if (isError) throw new Error(decodedOutput)

      const markets: Market[] = []

      for (const address of marketsAddresses) {
        const result = await contractQuery(api, address, marketContract, 'view_market_data')
        const {
          output: marketData,
          isError,
          decodedOutput,
        } = decodeOutput(result, marketContract, 'view_market_data')
        if (isError) throw new Error(decodedOutput)
        const market: Market = {
          address,
          name: marketData[0],
          symbol: marketData[1],
          decimals: marketData[2],
        }
        markets.push(market)
      }

      setMarkets(markets)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching greeting. Try again…')
    } finally {
      setMarketsAreLoading(false)
    }
  }

  useEffect(() => {
    fetchMarkets()
  }, [managerContract])

  return { markets, marketsAreLoading }
}

// const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()

//   // Update Greeting /*
//   const updateGreeting = async ({ newMessage }: UpdateGreetingValues) => {
//     if (!activeAccount || !contract || !activeSigner || !api) {
//       toast.error('Wallet not connected. Try again…')
//       return
//     }

//     // Send transaction
//     setUpdateIsLoading(true)
//     try {
//       await contractTxWithToast(api, activeAccount.address, contract, 'setMessage', {}, [
//         newMessage,
//       ])
//       reset()
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setUpdateIsLoading(false)
//       fetchGreeting()
//     }
//   }*/
