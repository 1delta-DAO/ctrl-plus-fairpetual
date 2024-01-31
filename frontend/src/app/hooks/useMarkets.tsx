'use client'

import { useEffect, useState } from 'react'

import marketAbi from '@/abis/market.json'
import { ContractIds, getDeployments } from '@/deployments/deployments'
import { ContractPromise } from '@polkadot/api-contract'
import { contractQuery, decodeOutput, useInkathon } from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { formatWithDecimals } from '@/utils/formatters'
import { Market } from '@/utils/types'

export const useMarkets = () => {
  const { api, activeAccount } = useInkathon()
  const [marketsAreLoading, setMarketsAreLoading] = useState<boolean>(false)
  const [depositBalancesAreLoading, setDepositBalancesAreLoading] = useState<boolean>(false)
  const [marketsPriceAreLoading, setMarketsPriceAreLoading] = useState<boolean>(false)
  const [markets, setMarkets] = useState<Market[]>()
  const [entryPrices, setEntryPrices] = useState<{ [key: string]: string }>()
  const [depositBalances, setDepositBalances] = useState<{ [key: string]: number }>()

  const fetchMarkets = async () => {
    if (!api) return

    const deployments = await getDeployments()
    const managerContractDeployment = deployments.find(
      (deployment) => deployment.contractId === ContractIds.Manager,
    )

    if (!managerContractDeployment) {
      toast.error('Manager contract not deployed. Try again…')
      return
    }

    setMarketsAreLoading(true)

    try {
      const managerContract = new ContractPromise(
        api,
        managerContractDeployment.abi,
        managerContractDeployment.address,
      )
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

    setDepositBalancesAreLoading(true)

    try {
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

        const balance = formatWithDecimals(balanceToFormat, market?.decimals || 0)

        balances[address] = balance
      }
      setDepositBalances(balances)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching deposit balances. Try again…')
    } finally {
      setDepositBalancesAreLoading(false)
    }
  }

  const fetchMarketsPrice = async () => {
    if (!markets || !api) return

    const updatedMarkets = []
    const marketPrices: { [key: string]: string } = {}

    setMarketsPriceAreLoading(true)

    try {
      for (const market of markets) {
        const address = market.address
        const marketContract = new ContractPromise(api, marketAbi, address)
        const result = await contractQuery(api, address, marketContract, 'view_market_price')
        const {
          output: marketPrice,
          isError: isError,
          decodedOutput: decodedOutput,
        } = decodeOutput(result, marketContract, 'view_market_price')
        if (isError) throw new Error(decodedOutput)
        const price = marketPrice.Ok
        const updatedMarket = {
          ...market,
          price: price,
        }
        updatedMarkets.push(updatedMarket)
        marketPrices[address] = price
      }
      setMarkets(updatedMarkets)
      setEntryPrices(marketPrices)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching markets price. Try again…')
    } finally {
      setMarketsPriceAreLoading(false)
    }
  }

  const getLiquidationPrice = async (marketAddress: string, leverage: number, isLong: boolean) => {
    if (!api) return

    try {
      const marketContract = new ContractPromise(api, marketAbi, marketAddress)
      const result = await contractQuery(api, '', marketContract, 'view_liquidation_price', {}, [
        marketAddress,
        leverage,
        isLong,
      ])
      const {
        output: liquidationPrice,
        isError: isError,
        decodedOutput: decodedOutput,
      } = decodeOutput(result, marketContract, 'view_liquidation_price')
      if (isError) throw new Error(decodedOutput)
      return liquidationPrice
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching liquidation price. Try again…')
    }

    return 0
  }

  useEffect(() => {
    const fetchMarketData = async () => {
      await fetchMarkets()
      await fetchMarketsPrice()
    }
    fetchMarketData()
  }, [api])

  useEffect(() => {
    fetchDepositBalances()
  }, [markets])

  return {
    markets,
    marketsAreLoading,
    depositBalances,
    depositBalancesAreLoading,
    marketsPriceAreLoading,
    entryPrices,
    fetchMarketsPrice,
    fetchDepositBalances,
    getLiquidationPrice,
  }
}
