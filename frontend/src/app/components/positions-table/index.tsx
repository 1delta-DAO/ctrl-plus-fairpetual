import Image from 'next/image'
import { FC } from 'react'

import { useManagePosition } from '@/app/hooks/useManagePosition'
import { Button } from '@/components/ui/button'
import { SymbolsToIcons } from '@/utils/constants'
import {
  formatDollarAmount,
  formatDollarAmountWithSign,
  formatPercentage,
  formatWithDecimals,
} from '@/utils/formatters'
import { Market, MarketPosition } from '@/utils/types'

interface RowProps {
  position: MarketPosition
  market: Market
}

const Row = ({ position, market }: RowProps) => {
  const { closePosition } = useManagePosition({ marketAddress: market.address })

  const positionPnlPercentage = formatPercentage(parseInt(position.pnlPercentage))

  const longShortcolor = position.isLong ? 'text-green-500' : 'text-red-500'
  const pnlColor = parseInt(position.pnlPercentage) >= 0 ? 'text-green-500' : 'text-red-500'

  const collateralAmount = formatWithDecimals(position.collateralAmount, market.decimals)
  const collateralUsd = formatWithDecimals(position.collateralUsd, 6)
  const positionNetValue = collateralUsd + collateralUsd * (parseInt(position.pnlPercentage) / 100)
  const pnlUsd = positionNetValue - collateralUsd
  const size = collateralAmount * parseInt(position.leverage)

  const entryPrice = formatWithDecimals(position.entryPrice, 6)
  const marketPrice = formatWithDecimals(position.price, 6)
  const liquidationPrice = formatWithDecimals(position.liquidationPrice, 6)

  const handleClosePosition = async () => {
    if (closePosition) {
      await closePosition(position.id)
    }
  }

  return (
    <tr className="text-sm">
      <td>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Image
              src={SymbolsToIcons[market.symbol]}
              width={17}
              height={17}
              className="rounded-full"
              alt="Asset Icon"
            />
            <span>{market.symbol}</span>
          </div>
          <div className="flex gap-1">
            <span className={`font-bold ${longShortcolor}`}>
              {position.isLong ? 'Long' : 'Short'}
            </span>
            <span>{position.leverage}x</span>
          </div>
        </div>
      </td>

      <td>
        <div className="flex flex-col">
          <span>{formatDollarAmount(positionNetValue)}</span>
          <span className={pnlColor}>
            {formatDollarAmountWithSign(pnlUsd)} ({positionPnlPercentage})
          </span>
        </div>
      </td>

      <td>{formatDollarAmount(size)}</td>

      <td>
        <div className="flex flex-col">
          <span>{formatDollarAmount(collateralUsd)}</span>
          <span className="text-gray-400">({collateralAmount} AZERO)</span>
        </div>
      </td>

      <td>{formatDollarAmount(entryPrice, 4)}</td>

      <td>{formatDollarAmount(marketPrice, 4)}</td>

      <td>{formatDollarAmount(liquidationPrice, 4)}</td>

      <td>
        <Button
          style={{
            height: 'auto',
            padding: '0.5em 1em',
          }}
          onClick={handleClosePosition}
        >
          Close
        </Button>
      </td>
    </tr>
  )
}

interface PositionsTableProps {
  markets: Market[] | undefined
  positions: { [key: string]: MarketPosition[] }
}

const PositionsTable: FC<PositionsTableProps> = ({ markets, positions }) => {
  let noPositions = true
  for (const key in positions) {
    if (positions[key].length > 0) {
      noPositions = false
      break
    }
  }

  return (
    <>
      <div className="flex w-full items-center gap-14 rounded-[0.35em] bg-violet-800 p-3">
        <table className="w-full table-fixed">
          <thead className="text-left">
            <tr>
              <th>Position</th>
              <th>Net Value</th>
              <th>Size</th>
              <th>Collateral</th>
              <th>Entry Price</th>
              <th>Mark. Price</th>
              <th>Liq. Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!noPositions && markets ? (
              markets.map((market) => {
                const marketPositions = positions[market.address]
                if (!marketPositions) return null

                return marketPositions.map((marketPosition) => {
                  return <Row key={marketPosition.id} position={marketPosition} market={market} />
                })
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-6 text-center text-lg font-bold">
                  You have no open positions, open a trade!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default PositionsTable
