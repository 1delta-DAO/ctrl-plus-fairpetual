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
