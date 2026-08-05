/**
 * minERP Centralized Indian Currency (INR / ₹) Formatter
 */
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

export function formatCurrency(amount) {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  if (numeric < 0) {
    return `-${CURRENCY_SYMBOL}${Math.abs(numeric).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${CURRENCY_SYMBOL}${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

