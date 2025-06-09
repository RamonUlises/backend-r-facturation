export function toUTCMinus6(date: Date) {
  const utcMinus6 = new Date(date.getTime() - 6 * 60 * 60 * 1000);
  return new Date(Date.UTC(utcMinus6.getUTCFullYear(), utcMinus6.getUTCMonth(), utcMinus6.getUTCDate()));
}

export function getMondayUTCMinus6(date: Date) {
  const baseDate = toUTCMinus6(date);
  const day = baseDate.getUTCDay();
  const diff = baseDate.getUTCDate() - day + (day === 0 ? -6 : 1); // si es domingo, retrocede 6
  return new Date(Date.UTC(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), diff));
}