import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("./calculations.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const {
  calculateReferralBonuses,
  calculateStrongLegBonus,
  decimalUnits,
  formatUnits,
  getVolumeLadderTier,
} = await import(`data:text/javascript,${encodeURIComponent(compiled)}`);

test("all ten referral levels apply the specified profit and lot rates", () => {
  const expected = [
    ["5.0000", "2.0000"],
    ["4.0000", "2.0000"],
    ["3.0000", "2.0000"],
    ["2.0000", "1.0000"],
    ["2.0000", "0.5000"],
    ["2.0000", "0.5000"],
    ["2.0000", "0.5000"],
    ["2.0000", "0.5000"],
    ["2.0000", "0.5000"],
    ["1.0000", "0.5000"],
  ];
  expected.forEach(([profitShare, lotRebate], index) => {
    assert.deepEqual(
      calculateReferralBonuses({ level: index + 1, tradingProfit: "100.0000", lotsTraded: "1.0000" }),
      { profitShare, lotRebate },
    );
  });
});

test("negative profit is not credited and fractional lots retain four-place precision", () => {
  assert.deepEqual(
    calculateReferralBonuses({ level: 5, tradingProfit: "-12.5000", lotsTraded: "0.3333" }),
    { profitShare: "0.0000", lotRebate: "0.1667" },
  );
  assert.equal(formatUnits(decimalUnits("123456.7891")), "123456.7891");
  assert.throws(() => decimalUnits("1.00001"), RangeError);
  assert.throws(() => calculateReferralBonuses({ level: 11, tradingProfit: "1", lotsTraded: "1" }), RangeError);
});

test("strong-leg qualifications and highest volume ladder tier use boundary values", () => {
  assert.deepEqual(calculateStrongLegBonus({ totalTeamVolume: "499999.9999", strongLegVolume: "250000", strongLegLots: "4" }), { tier: 0, bonus: "0.0000" });
  assert.deepEqual(calculateStrongLegBonus({ totalTeamVolume: "500000", strongLegVolume: "250000", strongLegLots: "4.2500" }), { tier: 1, bonus: "4.2500" });
  assert.deepEqual(calculateStrongLegBonus({ totalTeamVolume: "1000000", strongLegVolume: "500000", strongLegLots: "4.2500" }), { tier: 2, bonus: "4.2500" });
  assert.deepEqual(getVolumeLadderTier("9999.9999"), { tier: 0, basisPoints: 0 });
  assert.deepEqual(getVolumeLadderTier("10000"), { tier: 1, basisPoints: 100 });
  assert.deepEqual(getVolumeLadderTier("50000000"), { tier: 9, basisPoints: 800 });
});
