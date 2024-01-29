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
import { ContractPromise } from '@polkadot/api-contract'

export const useFetchMarkets = () => {
  const { api, activeAccount } = useInkathon()
  const { contract: managerContract } = useRegisteredContract(ContractIds.Manager)
  const { contract: marketContract } = useRegisteredContract(ContractIds.Market)
  const [marketsAreLoading, setMarketsAreLoading] = useState<boolean>(false)
  const [depositBalancesAreLoading, setDepositBalancesAreLoading] = useState<boolean>(false)
  const [marketAddresses, setMarketAddresses] = useState<string[]>()
  const [markets, setMarkets] = useState<Market[]>()
  const [depositBalances, setDepositBalances] = useState<{ [key: string]: number }>()

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

      setMarketAddresses(marketsAddresses)

      const markets: Market[] = []
      for (const address of marketsAddresses) {
        const contract = new ContractPromise(api, marketContract.abi, address)
        const result = await contractQuery(api, address, contract, 'view_market_data')
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

  const fetchDepositBalances = async () => {
    if (!marketContract || !api) return
    if (!marketAddresses) return

    const balances: { [key: string]: number } = {}

    for (const address of marketAddresses) {
      const market = markets?.find((market) => market.address === address)
      const contract = new ContractPromise(api, marketContract.abi, address)
      const result = await contractQuery(api, address, contract, 'psp22::balance_of', {}, [
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
  }, [marketAddresses])

  return {
    markets,
    marketsAreLoading,
    depositBalances,
    depositBalancesAreLoading,
    fetchDepositBalances,
  }
}
