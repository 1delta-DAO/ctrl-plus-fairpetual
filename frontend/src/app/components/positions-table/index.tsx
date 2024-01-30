import Image from 'next/image'
import { FC } from 'react'

import { Button } from '@/components/ui/button'
import { Positions, SymbolsToIcons } from '@/utils/constants'
import { formatDollarAmount, formatPercentage } from '@/utils/formatters'
import { Market, MarketPosition, Position } from '@/utils/types'

interface RowProps {
  position: Position
}

const Row = ({ position }: RowProps) => {
  const positionNetValue = position.collateral * 1.12
  const positionPnl = positionNetValue - position.collateral
  const positionPnlPercentage = (positionPnl / position.collateral) * 100

  const longShortcolor = position.type === 'Long' ? 'text-green-500' : 'text-red-500'
  const pnlColor = positionPnl > 0 ? 'text-green-500' : 'text-red-500'

  return (
    <tr className="text-sm">
      <td>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Image
              src={SymbolsToIcons[position.assetSymbol]}
              width={17}
              height={17}
              className="rounded-full"
              alt="Asset Icon"
            />
            <span>{position.assetSymbol}</span>
          </div>
          <div className="flex gap-1">
            <span className={`font-bold ${longShortcolor}`}>{position.type}</span>
            <span>{position.leverage}x</span>
          </div>
        </div>
      </td>

      <td>
        <div className="flex flex-col">
          <span>{formatDollarAmount(positionNetValue)}</span>
          <span className={pnlColor}>
            {formatDollarAmount(positionPnl)} ({formatPercentage(positionPnlPercentage)})
          </span>
        </div>
      </td>

      <td>{formatDollarAmount(position.size)}</td>

      <td>
        <div className="flex flex-col">
          <span>{formatDollarAmount(position.collateral)}</span>
          <span className="text-gray-400">(- AZERO)</span>
        </div>
      </td>

      <td>{formatDollarAmount(position.entryPrice)}</td>

      <td>-</td>

      <td>-</td>

      <td>
        <Button
          style={{
            height: 'auto',
            padding: '0.5em 1em',
          }}
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
  const positionsLength = Object.keys(positions).length

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
              <th>Mark Price</th>
              <th>Liq. Price</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {positionsLength > 0 ? (
              Positions.map((position, index) => {
                return <Row key={index} position={position} />
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
