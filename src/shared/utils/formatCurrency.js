/**
 * Formats a number as Saudi Riyals.
 * e.g. 320 -> "SAR 320.00"
 */
export default function formatCurrency(amount) {
  return `SAR ${Number(amount).toFixed(2)}`;
}
