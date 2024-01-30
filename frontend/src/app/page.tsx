'use client'

import { useEffect } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { Navbar } from '@/app/components/navbar'

import ChartInfo from './components/chart-info'
import PositionManagement from './components/position-management'
import PositionsTable from './components/positions-table'
import TradingViewChart from './components/tradingview-chart'
import { useMarkets } from './hooks/useMarkets'
import { usePositions } from './hooks/usePositions'

export default function Home() {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  const chartInfo = {
    price: 1.28,
    change24: 0.12,
  }

  const { markets } = useMarkets()
  const { positions } = usePositions({ markets })

  return (
    <>
      <Navbar />
      <div className="container relative flex max-w-[1600px] grow items-start gap-4 py-4">
        <div className="flex w-full flex-col items-center gap-4 rounded bg-violet-950 p-4">
          <ChartInfo ChartInfo={chartInfo} />
          <TradingViewChart />
          <PositionsTable markets={markets} positions={positions} />
        </div>
        <div className="w-[40rem]">
          <PositionManagement markets={markets} />
        </div>
      </div>
    </>
  )
}
