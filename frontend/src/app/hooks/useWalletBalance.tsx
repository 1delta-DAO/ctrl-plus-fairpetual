import psp22abi from '@/abis/psp22.json'
import { ContractPromise } from '@polkadot/api-contract'
import { contractQuery, decodeOutput, getBalance, useInkathon } from '@scio-labs/use-inkathon'

import { formatWithDecimals } from '@/utils/formatters'
import { Market } from '@/utils/types'

export const useWalletBalance = () => {
  const { api, activeAccount, activeChain } = useInkathon()

  const getNativeBalance = async () => {
    if (!activeAccount || !api) return

    const balance = await getBalance(api, activeAccount.address)
    return balance.balanceFormatted
  }

  const getPSP22Balance = async (asset: Market) => {
    if (api && activeAccount && asset.symbol !== 'AZERO') {
      const psp22Contract = new ContractPromise(api, psp22abi, asset.address)
      const result = await contractQuery(api, '', psp22Contract, 'PSP22::balance_of', {}, [
        activeAccount.address,
      ])
      const {
        output: balance,
        isError,
        decodedOutput,
      } = decodeOutput(result, psp22Contract, 'PSP22::balance_of')
      if (isError) throw new Error(decodedOutput)
      return parseInt(balance) == 0 ? 0 : formatWithDecimals(balance, asset.decimals).toPrecision(4)
    }
  }

  return {
    getNativeBalance,
    getPSP22Balance,
  }
}
