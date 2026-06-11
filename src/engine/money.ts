/** VND formatting. Always whole dong, thousands separators with dots (vi convention). */

export function formatVND(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded).toString();
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += '.';
  }
  return `${sign}${out}\u00A0₫`;
}
