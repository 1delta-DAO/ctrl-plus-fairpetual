import { getBalance, getPSP22Balances, useInkathon } from '@scio-labs/use-inkathon'

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
      const psp22balances = await getPSP22Balances(
        api,
        activeAccount.address,
        activeChain?.network || '',
      )
      const balanceData = psp22balances.find((balance) => balance.tokenSymbol === asset.symbol)
      return balanceData?.balanceFormatted
    }
  }

  return {
    getNativeBalance,
    getPSP22Balance,
  }
}
