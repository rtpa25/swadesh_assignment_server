export const __isProd__ = process.env.NODE_ENV === 'production';
export const adminUserUuid = process.env.ADMIN_USER_UUID || 'admin';
export const adminUserId = '6353d66e78811f65d1f9d0b7';
export const oneMinuteInMilliseconds = 60000;

export const timeIntervalForCreditTransactions = (amount: number): number => {
  if (amount < 500) {
    return oneMinuteInMilliseconds;
  } else if (amount <= 1000 && amount > 500) {
    return 5 * oneMinuteInMilliseconds;
  } else {
    return 10 * oneMinuteInMilliseconds;
  }
};
