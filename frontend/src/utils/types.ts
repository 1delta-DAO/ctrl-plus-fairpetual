export enum PositionType {
  LONG = 'Long',
  SHORT = 'Short',
}

export interface Asset {
  symbol: string
  name: string
  icon: string
}

export interface Position {
  type: PositionType
  assetSymbol: string
  leverage: number
  size: number
  collateral: number
  entryPrice: number
}
