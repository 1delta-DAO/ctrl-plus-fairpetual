import { useEffect, useState } from 'react'

import marketAbi from '@/abis/market.json'
import { ContractPromise } from '@polkadot/api-contract'
import { contractQuery, decodeOutput, useInkathon } from '@scio-labs/use-inkathon'

import { Market, MarketPosition } from '@/utils/types'

interface usePositionsProps {
  markets: Market[] | undefined
}

export const usePositions = ({ markets }: usePositionsProps) => {
  const { api, activeAccount } = useInkathon()

  const [positions, setPositions] = useState<{ [key: string]: MarketPosition[] }>({})

  const fetchPositions = async () => {
    if (!markets?.length || !api) return

    for (const market of markets) {
      const marketAddress = market.address
      const marketContract = new ContractPromise(api, marketAbi, marketAddress)
      const result = await contractQuery(api, marketAddress, marketContract, 'view_all', {}, [
        activeAccount?.address ?? '',
      ])
      const {
        output: marketPositionsData,
        isError: isError,
        decodedOutput: decodedOutput,
      } = decodeOutput(result, marketContract, 'view_all')
      if (isError) throw new Error(decodedOutput)

      const positions: MarketPosition[] = []

      for (const positionData of marketPositionsData.Ok) {
        const position = positionData[0]
        const pnlPercentage = positionData[1]
        const price = positionData[2]
        const marketPosition: MarketPosition = {
          user: position.user,
          id: position.id,
          collateralAmount: position.collateralAmount,
          collateralAsset: position.collateralAsset,
          collateralUsd: position.collateralUsd,
          liquidationPrice: position.liquidationPrice,
          entryPrice: position.entryPrice,
          leverage: position.leverage,
          isLong: position.isLong,
          blockOpen: position.blockOpen,
          pnlPercentage,
          price,
        }
        positions.push(marketPosition)
      }

      setPositions((prevPositions) => ({
        ...prevPositions,
        [marketAddress]: positions,
      }))
    }
  }

  useEffect(() => {
    if (!markets?.length) return
    fetchPositions()
  }, [markets])

  return {
    fetchPositions,
    positions,
  }
}
