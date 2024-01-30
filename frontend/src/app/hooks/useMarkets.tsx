'use client'

import { useEffect, useState } from 'react'

import marketAbi from '@/abis/market.json'
import { ContractIds } from '@/deployments/deployments'
import { ContractPromise } from '@polkadot/api-contract'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { Market } from '@/utils/types'

export const useMarkets = () => {
  const { api, activeAccount } = useInkathon()
  const { contract: managerContract } = useRegisteredContract(ContractIds.Manager)
  const [marketsAreLoading, setMarketsAreLoading] = useState<boolean>(false)
  const [depositBalancesAreLoading, setDepositBalancesAreLoading] = useState<boolean>(false)
  const [markets, setMarkets] = useState<Market[]>()
  const [depositBalances, setDepositBalances] = useState<{ [key: string]: number }>()

  const fetchMarkets = async () => {
    if (!managerContract || !api) return

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
        const marketContract = new ContractPromise(api, marketAbi, address)
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
      toast.error('Error while fetching markets. Try again…')
    } finally {
      setMarketsAreLoading(false)
    }
  }

  const fetchDepositBalances = async () => {
    if (!markets || !api) return

    const balances: { [key: string]: number } = {}

    for (const market of markets) {
      const address = market?.address ?? ''
      const marketContract = new ContractPromise(api, marketAbi, address)
      const result = await contractQuery(api, address, marketContract, 'psp22::balance_of', {}, [
        activeAccount?.address ?? '',
      ])
      const {
        output: balanceToFormat,
        isError: isError,
        decodedOutput: decodedOutput,
      } = decodeOutput(result, marketContract, 'psp22::balance_of')
      if (isError) throw new Error(decodedOutput)

      const balance = parseInt(balanceToFormat.replace(/,/g, '')) / 10 ** (market?.decimals || 0)

      balances[address] = balance
    }

    setDepositBalances(balances)
  }

  useEffect(() => {
    fetchMarkets()
  }, [managerContract])

  useEffect(() => {
    fetchDepositBalances()
  }, [markets])

  return {
    markets,
    marketsAreLoading,
    depositBalances,
    depositBalancesAreLoading,
    fetchDepositBalances,
  }
}
