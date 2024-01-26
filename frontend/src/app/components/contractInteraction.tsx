'use client'

import { FC, useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

type UpdateGreetingValues = { newMessage: string }

export const ContractInteractions = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Manager)
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()

  // Fetch
  const fetchGreeting = async () => {
    if (!contract || !api) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'view_markets')
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'view_markets')
      if (isError) throw new Error(decodedOutput)
      console.log(output)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching greeting. Try again…')
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGreeting()
  }, [contract])
//   // Update Greeting /*
//   const updateGreeting = async ({ newMessage }: UpdateGreetingValues) => {
//     if (!activeAccount || !contract || !activeSigner || !api) {
//       toast.error('Wallet not connected. Try again…')
//       return
//     }

//     // Send transaction
//     setUpdateIsLoading(true)
//     try {
//       await contractTxWithToast(api, activeAccount.address, contract, 'setMessage', {}, [
//         newMessage,
//       ])
//       reset()
//     } catch (e) {
//       console.error(e)
//     } finally {
//       setUpdateIsLoading(false)
//       fetchGreeting()
//     }
//   }*/

}
