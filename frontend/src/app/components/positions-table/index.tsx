import { FC } from 'react'

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
            <tr>
              <td>Long</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>Close</td>
            </tr>
            <tr>
              <td>Short</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>Close</td>
            </tr>
            <tr>
              <td>Long</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>0.00</td>
              <td>Close</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

export default PositionsTable
