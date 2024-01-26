'use client'

import { FC, useEffect, useState } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { Navbar } from '@/app/components/navbar'
import { Button } from '@/components/ui/button'
import { Switcher, SwitcherButton } from '@/components/ui/switcher'
import { AZERO, wAZERO } from '@/utils/exampleData'

import InputBox from '../components/position-management/input-box'

const Title: FC<{
  children: React.ReactNode
}> = ({ children }) => <h1 className="text-left text-2xl font-bold text-white">{children}</h1>

const Subtitle: FC<{
  children: React.ReactNode
}> = ({ children }) => <h2 className="text-md text-left text-white">{children}</h2>

export default function HomePage() {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  const assets = [AZERO, wAZERO]
  const [asset, setAsset] = useState(assets[0])

  const [isDeposit, setIsDeposit] = useState(true)

  const toWrapOrUnwrap = asset === AZERO
  const inputLabel = isDeposit ? 'Send' : 'Receive'
  const buttonLabel = isDeposit
    ? `Deposit${toWrapOrUnwrap ? ' & Wrap' : ''}`
    : `Withdraw${toWrapOrUnwrap ? ' & Unwrap' : ''}`

  return (
    <>
      <Navbar />
      <div className="container relative flex max-w-[1600px] grow items-start gap-4 p-20">
        <div className="mx-auto flex w-fit flex-col gap-4">
          <div>
            <Title>Earn - Fairpetuals Pool</Title>
            <Subtitle>Deposit wAZERO to earn fees from the protocol.</Subtitle>
          </div>
          <div className="flex min-w-[35em] flex-col gap-4 rounded bg-violet-950 p-4">
            <Switcher>
              <SwitcherButton active={isDeposit} onClick={() => setIsDeposit(true)}>
                Deposit
              </SwitcherButton>
              <SwitcherButton active={!isDeposit} onClick={() => setIsDeposit(false)}>
                Withdraw
              </SwitcherButton>
            </Switcher>
            <InputBox
              topLeftLabel={inputLabel}
              selectedAssetSymbol={asset.symbol}
              assets={assets}
              onSetAsset={setAsset}
            />
            <Button className="rounded-[0.35em]">
              <span className="text-[1.1em] font-bold">{buttonLabel}</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
