import { formatVND } from '../money';

describe('formatVND', () => {
  it('formats with dot thousands separators', () => {
    expect(formatVND(0)).toBe('0\u00A0₫');
    expect(formatVND(500)).toBe('500\u00A0₫');
    expect(formatVND(35000)).toBe('35.000\u00A0₫');
    expect(formatVND(1234567)).toBe('1.234.567\u00A0₫');
    expect(formatVND(1000000000)).toBe('1.000.000.000\u00A0₫');
  });

  it('handles negatives and rounding', () => {
    expect(formatVND(-90000)).toBe('-90.000\u00A0₫');
    expect(formatVND(999.6)).toBe('1.000\u00A0₫');
  });
});
