/**
 * Formats a number as Saudi Riyals.
 * e.g. 320 -> "SAR 320.00"
 */
export default function formatCurrency(amount) {
  return `SAR ${Number(amount).toFixed(2)}`;
}

/**
 * Formats a minor currency unit (e.g. Halalas) to major unit with localized formatting.
 * e.g. "1500" -> SAR 15.00
 */
export function formatCurrencyMinor(amountStr, currencyCode = 'SAR') {
  if (amountStr === undefined || amountStr === null) return 'SAR 0.00';
  const amountNumber = Number(amountStr);
  if (isNaN(amountNumber)) return 'SAR 0.00';
  
  const majorAmount = amountNumber / 100;
  
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'code'
  }).format(majorAmount);
}
