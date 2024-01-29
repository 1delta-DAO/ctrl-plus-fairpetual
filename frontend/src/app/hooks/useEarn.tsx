import { useState } from 'react'

import marketAbi from '@/abis/market.json'
import { useContract, useInkathon } from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

interface useEarnDepositProps {
  marketAddress: string
}

export const useEarnDeposit = ({ marketAddress }: useEarnDepositProps) => {
  const { api, activeAccount } = useInkathon()
  const { contract: marketContract } = useContract(marketAbi, marketAddress)

  const [depositIsLoading, setDepositIsLoading] = useState<boolean>(false)
  const [depositNativeIsLoading, setDepositNativeIsLoading] = useState<boolean>(false)

  const deposit = async ({ amount }: { amount: number }) => {
    if (!activeAccount || !marketContract || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setDepositIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, marketContract, 'deposit', {}, [amount])
    } catch (e) {
      console.error(e)
    } finally {
      setDepositIsLoading(false)
    }
  }

  const depositNative = async ({ amount }: { amount: number }) => {
    if (!activeAccount || !marketContract || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setDepositNativeIsLoading(true)
    try {
      await contractTxWithToast(
        api,
        activeAccount.address,
        marketContract,
        'deposit_native',
        {
          value: amount,
        },
        [],
      )
    } catch (e) {
      console.error(e)
    } finally {
      setDepositNativeIsLoading(false)
    }
  }

  return {
    deposit,
    depositNative,
    depositIsLoading,
    depositNativeIsLoading,
  }
}

export const useEarnWithdraw = ({ marketAddress }: useEarnDepositProps) => {
  const { api, activeAccount } = useInkathon()
  const { contract: marketContract } = useContract(marketAbi, marketAddress)

  const [withdrawIsLoading, setWithdrawIsLoading] = useState<boolean>(false)
  const [withdrawNativeIsLoading, setWithdrawNativeIsLoading] = useState<boolean>(false)

  const withdraw = async ({ amount }: { amount: number }) => {
    if (!activeAccount || !marketContract || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setWithdrawIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, marketContract, 'withdraw', {}, [
        amount,
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setWithdrawIsLoading(false)
    }
  }

  const withdrawNative = async ({ amount }: { amount: number }) => {
    if (!activeAccount || !marketContract || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    setWithdrawNativeIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, marketContract, 'withdraw_native', {}, [
        amount,
      ])
    } catch (e) {
      console.error(e)
    } finally {
      setWithdrawNativeIsLoading(false)
    }
  }

  return {
    withdraw,
    withdrawNative,
    withdrawIsLoading,
    withdrawNativeIsLoading,
  }
}
