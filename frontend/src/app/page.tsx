'use client'

import { useEffect } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { Navbar } from '@/app/components/navbar'
import ChartInfo from './components/chart-info'
import PositionManagement from './components/position-management'
import TradingViewChart from './components/tradingview-chart'

export default function HomePage() {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  const chartInfo = {
    price: 1.28,
    change24: 0.12
  }

  return (
    <>
      <Navbar />
      <div className="container relative flex grow flex items-start py-4 max-w-[1600px] gap-4">
        <div className='w-full flex flex-col p-4 bg-purple-950 rounded gap-4 items-center'>
          <ChartInfo ChartInfo={chartInfo} />
          <TradingViewChart />
        </div>
        <div className='w-[40rem]'>
          <PositionManagement />
        </div>
      </div>
    </>
  )
}
