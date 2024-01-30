export const formatNumber = (number: number) => {
  return number.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export const formatPercentage = (percentage: number) => {
  const percentageFormatted = formatNumber(percentage)
  return percentage > 0 ? `+${percentageFormatted}%` : `-${percentageFormatted}%`
}

export const formatDollarAmount = (amount: number) => {
  return `$${formatNumber(amount)}`
}

export const formatWithDecimals = (amount: string, decimals: number) => {
  return parseInt(amount.replace(/,/g, '')) / 10 ** decimals
}
