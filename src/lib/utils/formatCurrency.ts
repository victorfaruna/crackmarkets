export const formatCurrency = (
  balance: string | number | bigint,
  decimals: number
): string => {
  if (balance === undefined || balance === null) return "0.00";

  const balanceStr = balance.toString();
  if (balanceStr === "0" || balanceStr === "") return "0.00";

  // Handle negative numbers
  const isNegative = balanceStr.startsWith("-");
  const absBalanceStr = isNegative ? balanceStr.slice(1) : balanceStr;

  let formatted = "";

  if (absBalanceStr.length <= decimals) {
    formatted = "0." + absBalanceStr.padStart(decimals, "0");
  } else {
    const integerPart = absBalanceStr.slice(0, absBalanceStr.length - decimals);
    const fractionalPart = absBalanceStr.slice(absBalanceStr.length - decimals);
    formatted = integerPart + "." + fractionalPart;
  }

  const [intPart, fracPart = ""] = formatted.split(".");

  // Format integer part with commas
  const formattedIntPart = new Intl.NumberFormat("en-US").format(
    BigInt(intPart)
  );

  // Clean up fractional part (remove trailing zeros)
  let cleanedFracPart = fracPart.replace(/0+$/, "");
  
  // Ensure at least 2 decimal places
  if (cleanedFracPart.length < 2) {
    cleanedFracPart = cleanedFracPart.padEnd(2, "0");
  }

  return `${isNegative ? "-" : ""}${formattedIntPart}.${cleanedFracPart}`;
};
