import { Position, PositionType } from './types'

// export const SymbolsToAssets: { [symbol: string]: Asset } = {
//   [BTC.symbol]: BTC,
//   [AZERO.symbol]: AZERO,
//   [wAZERO.symbol]: wAZERO,
// }

export const SymbolsToIcons: { [symbol: string]: string } = {
  // [BTC.symbol]: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png',
  AZERO: 'https://avatars.githubusercontent.com/u/54438045?s=200&v=4',
  WAZERO: 'https://avatars.githubusercontent.com/u/54438045?s=200&v=4',
}

export const Positions: Position[] = [
  {
    type: PositionType.SHORT,
    assetSymbol: 'WAZERO',
    leverage: 5,
    size: 3264,
    collateral: 652.8,
    entryPrice: 1.69,
  },
]
