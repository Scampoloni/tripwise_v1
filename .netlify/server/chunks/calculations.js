function calculateSpent(expenses = []) {
  if (!Array.isArray(expenses)) return 0;
  return expenses.reduce((sum, exp) => sum + toNumber(exp?.amount), 0);
}
function calculatePercentUsed(spent, budget) {
  const b = toNumber(budget);
  const s = toNumber(spent);
  if (b <= 0) return 0;
  return Math.round(s / b * 100);
}
function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
export {
  calculatePercentUsed as a,
  calculateSpent as c
};
