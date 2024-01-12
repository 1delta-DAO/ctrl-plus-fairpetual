export const formatPercentage = (percentage: number) => {
  return percentage > 0 ? `+${percentage}%` : `${percentage}%`
}

export const formatDollarAmount = (amount: number) => {
  return `$${amount.toFixed(2)}`
}
