export type Transfer = { from: string; to: string; amount: number }

export function computeTransfers(balances: Record<string, number>): Transfer[] {
  const debtors = Object.entries(balances)
    .filter(([, b]) => b < -0.005)
    .map(([socio, b]) => ({ socio, amount: Math.abs(b) }))
    .sort((a, b) => b.amount - a.amount)

  const creditors = Object.entries(balances)
    .filter(([, b]) => b > 0.005)
    .map(([socio, b]) => ({ socio, amount: b }))
    .sort((a, b) => b.amount - a.amount)

  const transfers: Transfer[] = []
  let di = 0
  let ci = 0

  while (di < debtors.length && ci < creditors.length) {
    const transfer = Math.min(debtors[di].amount, creditors[ci].amount)
    const rounded = Math.round(transfer * 100) / 100
    if (rounded >= 0.01) {
      transfers.push({ from: debtors[di].socio, to: creditors[ci].socio, amount: rounded })
    }
    debtors[di].amount -= transfer
    creditors[ci].amount -= transfer
    if (debtors[di].amount < 0.005) di++
    if (creditors[ci].amount < 0.005) ci++
  }

  return transfers
}
