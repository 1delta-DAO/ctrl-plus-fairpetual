export enum PositionType {
  LONG = 'Long',
  SHORT = 'Short',
}

export interface Asset {
  symbol: string
  name: string
  decimals: number
}

export interface Market extends Asset {
  address: string
}

export interface Position {
  type: PositionType
  assetSymbol: string
  leverage: number
  size: number
  collateral: number
  entryPrice: number
}

export interface MarketPosition {
  user: string
  id: number
  collateralAmount: number
  collateralAsset: string
  collateralUsd: number
  entryPrice: number
  leverage: number
  isLong: boolean
  blockOpen: number
}
