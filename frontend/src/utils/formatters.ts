export const formatNumber = (number: number) => {
  return number.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export const formatPercentage = (percentage: number) => {
  const percentageFormatted = formatNumber(percentage)
  const percentageFormattedWithoutSign = percentageFormatted.replace(/[-+]/g, '')
  return percentage >= 0
    ? `+${percentageFormattedWithoutSign}%`
    : `-${percentageFormattedWithoutSign}%`
}

export const formatDollarAmount = (amount: number) => {
  return `$${formatNumber(amount)}`
}

export const formatDollarAmountWithSign = (amount: number) => {
  const amountFormatted = formatNumber(amount)
  const amountFormattedWithoutSign = amountFormatted.replace(/[-+]/g, '')
  return amount >= 0 ? `+$${amountFormattedWithoutSign}` : `-$${amountFormattedWithoutSign}`
}

export const formatWithDecimals = (amount: string, decimals: number) => {
  return parseInt(amount.replace(/,/g, '')) / 10 ** decimals
}
