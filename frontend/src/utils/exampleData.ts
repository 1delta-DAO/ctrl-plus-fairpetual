import { Asset, Position, PositionType } from './types'

export const BTC: Asset = {
  symbol: 'BTC',
  name: 'Bitcoin',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png',
}

export const AZERO: Asset = {
  symbol: 'AZERO',
  name: 'Aleph Zero',
  icon: 'https://avatars.githubusercontent.com/u/54438045?s=200&v=4',
}

export const SymbolsToAssets: { [symbol: string]: Asset } = {
  [BTC.symbol]: BTC,
  [AZERO.symbol]: AZERO,
}

export const Positions: Position[] = [
  {
    type: PositionType.LONG,
    assetSymbol: BTC.symbol,
    leverage: 2,
    size: 14723,
    collateral: 7361.5,
    entryPrice: 38195,
  },
  {
    type: PositionType.SHORT,
    assetSymbol: AZERO.symbol,
    leverage: 5,
    size: 3264,
    collateral: 652.8,
    entryPrice: 1.69,
  },
]
