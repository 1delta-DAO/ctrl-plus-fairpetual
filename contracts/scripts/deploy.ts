import { getDeploymentData } from '@/utils/getDeploymentData'
import { initPolkadotJs } from '@/utils/initPolkadotJs'
import { writeContractAddresses } from '@/utils/writeContractAddresses'
import { deployContract } from '@scio-labs/use-inkathon/helpers'
import * as dotenv from 'dotenv'

const PRICE_ORACLE_ADDRESS_MAINNET = '5F7wPCMXX65RmL8oiuAFNKu2ydhvgcissDZ3NWZ5X85n2WPG'
const PRICE_ORACLE_ADDRESS_TESTNET = '5F5z8pZoLgkGapEksFWc2h7ZxH2vdh1A9agnhXvfdCeAfS9b'

const chainId = process.env.CHAIN || 'development'
dotenv.config({
  path: `.env.${chainId}`,
})

/**
 * Script that deploys the greeter contract and writes its address to a file.
 *
 * Parameters:
 *  - `DIR`: Directory to read contract build artifacts & write addresses to (optional, defaults to `./deployments`)
 *  - `CHAIN`: Chain ID (optional, defaults to `development`)
 *
 * Example usage:
 *  - `pnpm run deploy`
 *  - `CHAIN=alephzero-testnet pnpm run deploy`
 */
const deploy_psp22 = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const supply = 1000000
  const name = 'TestCoin'
  const symbol = 'TTC'
  const decimals = 8

  const { abi, wasm } = await getDeploymentData('psp22')
  const psp22 = await deployContract(api, account, abi, wasm, 'new', [
    supply,
    name,
    symbol,
    decimals,
  ])

  await writeContractAddresses(chain.network, {
    psp22,
  })
}

const deploy_wazero = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('wrapped_azero')
  const wrapped_azero = await deployContract(api, account, abi, wasm, 'new', [])

  await writeContractAddresses(chain.network, {
    wrapped_azero,
  })
}

const deploy_vault = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('vault')
  const vault = await deployContract(api, account, abi, wasm, 'new', [])

  await writeContractAddresses(chain.network, {
    vault,
  })
}

const deploy_market = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('market')
  const market = await deployContract(api, account, abi, wasm, 'default', [])

  await writeContractAddresses(chain.network, {
    market,
  })
}

const deploy_manager = async (wazeroAddress, vaultAddress) => {
  let oracleAddress = ''
  if (chainId == 'alephzero') {
    oracleAddress = PRICE_ORACLE_ADDRESS_MAINNET
  } else if (chainId == 'alephzero-testnet') {
    oracleAddress = PRICE_ORACLE_ADDRESS_TESTNET
  }

  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('manager')
  const version = 1
  const manager = await deployContract(api, account, abi, wasm, 'new', [version, oracleAddress, wazeroAddress, vaultAddress])

  await writeContractAddresses(chain.network, {
    manager,
  })
}

const main = async () => {
  try {
    await deploy_psp22()
    const wazeroAddress = await deploy_wazero()
    const vaultAddress = await deploy_vault()
    await deploy_market()
    await deploy_manager(wazeroAddress, vaultAddress)

    console.log('\nDeployments completed successfully')
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()