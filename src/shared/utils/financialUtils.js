/**
 * Financial formatting utilities.
 */

/**
 * Divides percentageBps by 100 to show the actual percentage.
 * e.g. 700 BPS = 7%
 */
export function formatBps(bps) {
  if (bps == null) return "0";
  return (Number(bps) / 100).toString();
}

/**
 * Divides fixedAmountMinor by 100 to show the main currency value.
 * e.g. 500 = 5
 */
export function formatMinorUnits(amount) {
  if (amount == null) return "0";
  return (Number(amount) / 100).toString();
}
