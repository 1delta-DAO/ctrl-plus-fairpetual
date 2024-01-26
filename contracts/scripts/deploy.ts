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

  return psp22.address
}

const deploy_wazero = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('wrapped_azero')
  const wrapped_azero = await deployContract(api, account, abi, wasm, 'new', [])

  await writeContractAddresses(chain.network, {
    wrapped_azero,
  })

  return wrapped_azero.address
}

const deploy_faker = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('faker')
  const faker = await deployContract(api, account, abi, wasm, 'new', [])

  await writeContractAddresses(chain.network, {
    faker,
  })

  return faker.address
}

const deploy_vault = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('vault')
  const vault = await deployContract(api, account, abi, wasm, 'new', [])

  await writeContractAddresses(chain.network, {
    vault,
  })

  return vault.address
}

/*
  params:
    name: Option<String>,
    symbol: Option<String>,
    decimals: u8,
    underlying_asset: AccountId,
    oracle: AccountId,
    vault: AccountId,
    wazero: AccountId,
    liquidation_threshold: i8,
    liquidation_penalty: u8,
    protocol_fee: u8,
*/
const deploy_market = async (underlying_asset, oracle, vault, wazero) => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('market')
  const market = await deployContract(api, account, abi, wasm, 'new', [
    "Wrapped AZERO",
    "WAZERO",
    12,
    underlying_asset,
    oracle,
    vault,
    wazero,
    -80,
    10,
    5,
  ])

  await writeContractAddresses(chain.network, {
    market,
  })

  return market.address
}

const deploy_manager = async (wazeroAddress, vaultAddress, marketAddresses) => {
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
  const manager = await deployContract(api, account, abi, wasm, 'new', [
    version, 
    oracleAddress, 
    wazeroAddress, 
    vaultAddress,
    marketAddresses,
  ])

  await writeContractAddresses(chain.network, {
    manager,
  })
}

const main = async () => {
  try {
    const wazeroAddress = await deploy_wazero()
    const fakerAddress = await deploy_faker()
    const vaultAddress = await deploy_vault()
    const markets = []
    markets.push(await deploy_market(wazeroAddress, fakerAddress, vaultAddress, wazeroAddress))
    await deploy_manager(wazeroAddress, vaultAddress, markets)

    console.log('\nDeployments completed successfully')
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()