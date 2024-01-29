import { getDeploymentData } from '@/utils/getDeploymentData'
import { initPolkadotJs } from '@/utils/initPolkadotJs'
import { writeContractAddresses } from '@/utils/writeContractAddresses'
import { ContractPromise } from '@polkadot/api-contract'
import { contractTx, deployContract } from '@scio-labs/use-inkathon/helpers'
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

  const pair = "AZERO/USD"
  const price = 100000000000000

  const faker = await deployContract(api, account, abi, wasm, 'new', [
    pair, 
    price
  ])

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

  return vault.hash
}

const deploy_market = async () => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('market')
  const market = await deployContract(api, account, abi, wasm, 'default', [])

  await writeContractAddresses(chain.network, {
    market,
  })

  return market.hash
}

const deploy_market_with_manager = async (
    managerAddress,
    marketHash,
    name,
    symbol,
    underlyingAsset,
    liquidationThreshold,
    liquidationPenalty,
    protocolFee,
  ) => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('manager')
  const contract = new ContractPromise(api, abi, managerAddress)
  const params = [
    marketHash,
    name,
    symbol,
    underlyingAsset,
    liquidationThreshold,
    liquidationPenalty,
    protocolFee
  ]

  await contractTx(api, account, contract, 'deploy_market', {}, params)
}

const add_asset_to_vault = async (managerAddress, asset) => {
  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('manager')
  const contract = new ContractPromise(api, abi, managerAddress)
  const params = [
    asset,
  ]

  await contractTx(api, account, contract, 'add_collateral_asset', {}, params)
}

const deploy_manager = async (version, vaultHash, wazeroAddress, oracleAddressParam) => {
  let oracleAddress = oracleAddressParam
  if (chainId == 'alephzero') {
    oracleAddress = PRICE_ORACLE_ADDRESS_MAINNET
  } else if (chainId == 'alephzero-testnet') {
    oracleAddress = PRICE_ORACLE_ADDRESS_TESTNET
  }

  const initParams = await initPolkadotJs()
  const { api, chain, account } = initParams

  const { abi, wasm } = await getDeploymentData('manager')
  const manager = await deployContract(api, account, abi, wasm, 'new', [
    version, 
    vaultHash, 
    oracleAddress, 
    wazeroAddress,
  ])

  await writeContractAddresses(chain.network, {
    manager,
  })

  return manager.address
}

const main = async () => {
  try {
    const wazeroAddress = await deploy_wazero()
    const fakerAddress = await deploy_faker()
    const vaultHash = await deploy_vault()
    const marketHash = await deploy_market()
    const managerAddress = await deploy_manager(1, vaultHash, wazeroAddress, fakerAddress)

    await add_asset_to_vault(managerAddress, wazeroAddress)
    await deploy_market_with_manager(
      managerAddress,
      marketHash,
      "Wrapped Azero",
      "WAZERO",
      wazeroAddress,
      -10,
      10,
      5,
    )

    console.log('\nDeployments completed successfully')
  } catch (error) {
    console.error(error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()