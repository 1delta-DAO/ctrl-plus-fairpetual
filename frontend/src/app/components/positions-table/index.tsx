import Image from 'next/image'
import { FC } from 'react'

import { Button } from '@/components/ui/button'
import { Positions, SymbolsToAssets } from '@/utils/exampleData'
import { Position } from '@/utils/types'

interface RowProps {
  position: Position
}

const Row = ({ position }: RowProps) => {
  const color = position.type === 'Long' ? 'text-green-500' : 'text-red-500'
  return (
    <tr>
      <td>
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-1">
            <Image
              src={SymbolsToAssets[position.assetSymbol].icon}
              width={17}
              height={17}
              className="rounded-full"
              alt="Asset Icon"
            />
            <span>{position.assetSymbol}</span>
          </div>
          <div className="flex gap-1">
            <span className={`font-bold ${color}`}>{position.type}</span>
            <span>{position.leverage}x</span>
          </div>
        </div>
      </td>

      <td>-</td>

      <td>${position.size.toLocaleString()}</td>

      <td>${position.collateral.toLocaleString()}</td>

      <td>${position.entryPrice.toLocaleString()}</td>

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

const PositionsTable: FC = () => {
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
            {Positions.map((position, index) => {
              return <Row key={index} position={position} />
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default PositionsTable
