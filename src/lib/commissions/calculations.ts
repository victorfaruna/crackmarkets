/** Pure plan calculations. Only verified trading records may be posted to the ledger. */
const PROFIT_BASIS_POINTS = [500n, 400n, 300n, 200n, 200n, 200n, 200n, 200n, 200n, 100n] as const;
const LOT_REBATE_UNITS = [20_000n, 20_000n, 20_000n, 10_000n, 5_000n, 5_000n, 5_000n, 5_000n, 5_000n, 5_000n] as const;
const VOLUME_TIERS = [
  [10_000n, 100],
  [50_000n, 200],
  [200_000n, 350],
  [1_000_000n, 500],
  [3_500_000n, 550],
  [8_000_000n, 600],
  [15_000_000n, 650],
  [30_000_000n, 700],
  [50_000_000n, 800],
] as const;

export function decimalUnits(value: string): bigint {
  if (!/^-?\d+(?:\.\d{1,4})?$/.test(value)) {
    throw new RangeError("Expected a decimal with at most four places.");
  }
  const negative = value.startsWith("-");
  const [whole, fraction = ""] = (negative ? value.slice(1) : value).split(".");
  const units = BigInt(whole) * 10_000n + BigInt(fraction.padEnd(4, "0") || "0");
  return negative ? -units : units;
}

export function formatUnits(units: bigint): string {
  const sign = units < 0n ? "-" : "";
  const positive = units < 0n ? -units : units;
  return `${sign}${positive / 10_000n}.${String(positive % 10_000n).padStart(4, "0")}`;
}

export function calculateReferralBonuses({
  level,
  tradingProfit,
  lotsTraded,
}: {
  level: number;
  tradingProfit: string;
  lotsTraded: string;
}) {
  if (!Number.isInteger(level) || level < 1 || level > 10) {
    throw new RangeError("Referral level must be from 1 to 10.");
  }
  const profit = decimalUnits(tradingProfit);
  const lots = decimalUnits(lotsTraded);
  if (lots < 0n) throw new RangeError("Lots cannot be negative.");

  const profitShare = profit > 0n
    ? (profit * PROFIT_BASIS_POINTS[level - 1] + 5_000n) / 10_000n
    : 0n;
  const lotRebate = (lots * LOT_REBATE_UNITS[level - 1] + 5_000n) / 10_000n;
  return {
    profitShare: formatUnits(profitShare),
    lotRebate: formatUnits(lotRebate),
  };
}

export function getVolumeLadderTier(totalVolume: string) {
  const volume = decimalUnits(totalVolume);
  if (volume < 0n) throw new RangeError("Volume cannot be negative.");
  let tier = 0;
  let basisPoints = 0;
  for (const [threshold, rate] of VOLUME_TIERS) {
    if (volume < threshold * 10_000n) break;
    tier++;
    basisPoints = rate;
  }
  return { tier, basisPoints };
}

export function calculateStrongLegBonus({
  totalTeamVolume,
  strongLegVolume,
  strongLegLots,
}: {
  totalTeamVolume: string;
  strongLegVolume: string;
  strongLegLots: string;
}) {
  const total = decimalUnits(totalTeamVolume);
  const strong = decimalUnits(strongLegVolume);
  const lots = decimalUnits(strongLegLots);
  if (total < 0n || strong < 0n || lots < 0n || strong > total) {
    throw new RangeError("Invalid strong-leg values.");
  }
  const tier = total >= 1_000_000n * 10_000n && strong >= 500_000n * 10_000n
    ? 2
    : total >= 500_000n * 10_000n && strong >= 250_000n * 10_000n
      ? 1
      : 0;
  return { tier, bonus: tier ? formatUnits(lots) : "0.0000" };
}
