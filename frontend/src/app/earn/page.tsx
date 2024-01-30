'use client'

import { FC, useEffect, useState } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { Navbar } from '@/app/components/navbar'
import { Button } from '@/components/ui/button'
import { Switcher, SwitcherButton } from '@/components/ui/switcher'
import { AZERO } from '@/utils/constants'
import { Market } from '@/utils/types'

import InputBox from '../components/position-management/input-box'
import { useEarnDeposit, useEarnWithdraw } from '../hooks/useEarn'
import { useMarkets } from '../hooks/useMarkets'
import { useWalletBalance } from '../hooks/useWalletBalance'

const Title: FC<{
  children: React.ReactNode
}> = ({ children }) => <h1 className="text-left text-2xl font-bold text-white">{children}</h1>

const Subtitle: FC<{
  children: React.ReactNode
}> = ({ children }) => <h2 className="text-md text-left text-white">{children}</h2>

export default function Earn() {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  const { markets, depositBalances, fetchDepositBalances } = useMarkets()
  const { getNativeBalance, getPSP22Balance } = useWalletBalance()

  const WAZERO = markets?.find((market) => market.symbol === 'WAZERO')

  const { deposit, depositNative } = useEarnDeposit({
    marketAddress: WAZERO?.address || '',
  })

  const { withdraw, withdrawNative } = useEarnWithdraw({
    marketAddress: WAZERO?.address || '',
  })

  const [asset, setAsset] = useState<Market>(AZERO)
  const assets = WAZERO ? [AZERO, WAZERO] : []

  const [isDeposit, setIsDeposit] = useState(true)
  const [amount, setAmount] = useState<string>('')
  const [walletBalance, setWalletBalance] = useState<string>('')

  const toWrapOrUnwrap = asset === AZERO
  const inputLabel = isDeposit ? 'Send' : 'Receive'
  const buttonLabel = isDeposit
    ? `Deposit${toWrapOrUnwrap ? ' & Wrap' : ''}`
    : `Withdraw${toWrapOrUnwrap ? ' & Unwrap' : ''}`

  const depositOrWithdraw = isDeposit
    ? asset === AZERO
      ? depositNative
      : deposit
    : asset === AZERO
      ? withdrawNative
      : withdraw

  const formattedAmount = Number(amount) * 10 ** asset.decimals

  const depositedBalance = depositBalances?.[WAZERO?.address || ''] || 0

  const getWalletBalance = asset === AZERO ? getNativeBalance : getPSP22Balance

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!getWalletBalance) return
      const balance = await getWalletBalance(asset)
      setWalletBalance(balance || '0')
    }
    fetchWalletBalance()
  }, [asset, getWalletBalance])

  const handleDepositOrWithdraw = async () => {
    if (!amount) return
    await depositOrWithdraw({ amount: formattedAmount })
    await fetchDepositBalances()
  }

  useEffect(() => {
    setAmount('')
  }, [isDeposit])

  return (
    <>
      <Navbar />
      <div className="container relative flex max-w-[1600px] grow items-start gap-4 p-20">
        <div className="mx-auto flex w-fit flex-col gap-8">
          <div>
            <Title>Earn - Fairpetuals Pool</Title>
            <Subtitle>Deposit wAZERO to earn fees from the protocol.</Subtitle>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-row justify-between">
              <div className="flex gap-2">
                <Subtitle>Your locked tokens:</Subtitle>
                <Subtitle>
                  <span className="font-bold text-violet-500">{depositedBalance} wAZERO</span>
                </Subtitle>
              </div>
              <div className="flex gap-2">
                <Subtitle>APR:</Subtitle>
                <Subtitle>
                  <span className="font-bold text-violet-500">13.35%</span>
                </Subtitle>
              </div>
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
                markets={assets}
                inputAmount={amount}
                walletBalance={walletBalance}
                setInputAmount={setAmount}
                onSetAsset={setAsset}
              />
              <Button
                className="rounded-[0.35em]"
                onClick={handleDepositOrWithdraw}
                disabled={amount === '' || !formattedAmount}
              >
                <span className="text-[1.1em] font-bold">{buttonLabel}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
