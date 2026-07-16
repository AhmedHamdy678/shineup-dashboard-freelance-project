/**
 * Formats a number as Egyptian Pounds.
 * e.g. 320 -> "EGP 320.00"
 */
export default function formatCurrency(amount) {
  return `EGP ${Number(amount).toFixed(2)}`;
}
