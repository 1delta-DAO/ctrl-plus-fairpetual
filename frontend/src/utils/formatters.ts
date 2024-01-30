export const formatNumber = (number: number, precision = 2) => {
  return number.toLocaleString(undefined, { maximumFractionDigits: precision })
}

export const formatPercentage = (percentage: number) => {
  const percentageFormatted = formatNumber(percentage)
  const percentageFormattedWithoutSign = percentageFormatted.replace(/[-+]/g, '')
  return percentage >= 0
    ? `+${percentageFormattedWithoutSign}%`
    : `-${percentageFormattedWithoutSign}%`
}

export const formatDollarAmount = (amount: number, precision = 2) => {
  return `$${formatNumber(amount, precision)}`
}

export const formatDollarAmountWithSign = (amount: number) => {
  const amountFormatted = formatNumber(amount)
  const amountFormattedWithoutSign = amountFormatted.replace(/[-+]/g, '')
  return amount >= 0 ? `+$${amountFormattedWithoutSign}` : `-$${amountFormattedWithoutSign}`
}

export const formatWithDecimals = (amount: string, decimals: number) => {
  return parseInt(amount.replace(/,/g, '')) / 10 ** decimals
}
