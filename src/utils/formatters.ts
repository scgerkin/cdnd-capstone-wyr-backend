
export function getYearMonthDateString(unixTimestamp: number): string {
  return new Date(unixTimestamp).toISOString().split("T")[0]
}
