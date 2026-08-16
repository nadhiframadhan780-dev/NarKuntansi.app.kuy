export interface DepreciationScheduleItem {
  year: number;
  beginningBookValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
}

export interface DepreciationResult {
  method: string;
  cost: number;
  salvageValue: number;
  usefulLife: number;
  depreciationPerYear?: number;
  depreciationRate?: number;
  schedule: DepreciationScheduleItem[];
  totalDepreciation: number;
  formula: string;
}

/**
 * 1. Straight-Line Depreciation (Garis Lurus)
 * Formula: (Cost - Salvage) / Useful Life
 */
export function calculateStraightLineDepreciation(
  cost: number,
  salvageValue: number,
  usefulLife: number
): DepreciationResult {
  const depreciableAmount = Math.max(0, cost - salvageValue);
  const annualDepreciation = usefulLife > 0 ? Math.round(depreciableAmount / usefulLife) : 0;

  const schedule: DepreciationScheduleItem[] = [];
  let currentBookValue = cost;
  let accumulated = 0;

  for (let year = 1; year <= usefulLife; year++) {
    const beginningBookValue = currentBookValue;
    // In last year, adjust for exact salvage value
    let expense = annualDepreciation;
    if (year === usefulLife) {
      expense = Math.max(0, currentBookValue - salvageValue);
    } else if (currentBookValue - expense < salvageValue) {
      expense = Math.max(0, currentBookValue - salvageValue);
    }

    accumulated += expense;
    currentBookValue = Math.max(salvageValue, currentBookValue - expense);

    schedule.push({
      year,
      beginningBookValue,
      depreciationExpense: expense,
      accumulatedDepreciation: accumulated,
      endingBookValue: currentBookValue,
    });
  }

  return {
    method: 'Garis Lurus (Straight-Line)',
    cost,
    salvageValue,
    usefulLife,
    depreciationPerYear: annualDepreciation,
    schedule,
    totalDepreciation: accumulated,
    formula: 'Beban Penyusutan per Tahun = (Harga Perolehan − Nilai Residu) / Umur Manfaat',
  };
}

/**
 * 2. Declining Balance & Double Declining Balance (Saldo Menurun / Saldo Menurun Ganda)
 * Formula: Book Value * Rate% (Rate = 2 * (1 / UsefulLife) for double declining)
 */
export function calculateDecliningBalanceDepreciation(
  cost: number,
  salvageValue: number,
  usefulLife: number,
  multiplier = 2
): DepreciationResult {
  const rate = usefulLife > 0 ? (multiplier / usefulLife) : 0;
  const schedule: DepreciationScheduleItem[] = [];
  let currentBookValue = cost;
  let accumulated = 0;

  for (let year = 1; year <= usefulLife; year++) {
    const beginningBookValue = currentBookValue;
    let expense = Math.round(beginningBookValue * rate);

    // Cannot depreciate below salvage value
    if (currentBookValue - expense < salvageValue || year === usefulLife) {
      expense = Math.max(0, currentBookValue - salvageValue);
    }

    accumulated += expense;
    currentBookValue = Math.max(salvageValue, currentBookValue - expense);

    schedule.push({
      year,
      beginningBookValue,
      depreciationExpense: expense,
      accumulatedDepreciation: accumulated,
      endingBookValue: currentBookValue,
    });
  }

  return {
    method: multiplier === 2 ? 'Saldo Menurun Ganda (Double Declining)' : 'Saldo Menurun (Declining Balance)',
    cost,
    salvageValue,
    usefulLife,
    depreciationRate: rate * 100,
    schedule,
    totalDepreciation: accumulated,
    formula: `Tarif = ${multiplier} × (1 / Umur Manfaat) = ${(rate * 100).toFixed(1)}%; Beban = Nilai Buku Awal × Tarif (Berhenti saat Nilai Buku = Nilai Residu)`,
  };
}

/**
 * 3. Sum-of-Years-Digits (Jumlah Angka Tahun)
 * Formula: SYD = n(n+1)/2, Expense = (Remaining / SYD) * (Cost - Salvage)
 */
export function calculateSumOfYearsDigitsDepreciation(
  cost: number,
  salvageValue: number,
  usefulLife: number
): DepreciationResult {
  const syd = (usefulLife * (usefulLife + 1)) / 2;
  const depreciableAmount = Math.max(0, cost - salvageValue);
  const schedule: DepreciationScheduleItem[] = [];
  let currentBookValue = cost;
  let accumulated = 0;

  for (let year = 1; year <= usefulLife; year++) {
    const beginningBookValue = currentBookValue;
    const remainingLife = usefulLife - year + 1;
    const expense = syd > 0 ? Math.round((remainingLife / syd) * depreciableAmount) : 0;

    accumulated += expense;
    currentBookValue = Math.max(salvageValue, currentBookValue - expense);

    schedule.push({
      year,
      beginningBookValue,
      depreciationExpense: expense,
      accumulatedDepreciation: accumulated,
      endingBookValue: currentBookValue,
    });
  }

  return {
    method: 'Jumlah Angka Tahun (Sum-of-Years-Digits)',
    cost,
    salvageValue,
    usefulLife,
    schedule,
    totalDepreciation: accumulated,
    formula: 'Jumlah Angka Tahun = n(n+1)/2; Beban = (Sisa Umur Manfaat / Jumlah Angka Tahun) × (Harga Perolehan − Nilai Residu)',
  };
}

/**
 * 4. Units of Production (Satuan Hasil Produksi)
 */
export function calculateUnitsOfProductionDepreciation(
  cost: number,
  salvageValue: number,
  totalEstimatedUnits: number,
  yearlyActualUnits: number[]
): DepreciationResult {
  const depreciableAmount = Math.max(0, cost - salvageValue);
  const ratePerUnit = totalEstimatedUnits > 0 ? depreciableAmount / totalEstimatedUnits : 0;

  const schedule: DepreciationScheduleItem[] = [];
  let currentBookValue = cost;
  let accumulated = 0;

  yearlyActualUnits.forEach((units, idx) => {
    const year = idx + 1;
    const beginningBookValue = currentBookValue;
    let expense = Math.round(ratePerUnit * units);

    if (currentBookValue - expense < salvageValue) {
      expense = Math.max(0, currentBookValue - salvageValue);
    }

    accumulated += expense;
    currentBookValue = Math.max(salvageValue, currentBookValue - expense);

    schedule.push({
      year,
      beginningBookValue,
      depreciationExpense: expense,
      accumulatedDepreciation: accumulated,
      endingBookValue: currentBookValue,
    });
  });

  return {
    method: 'Satuan Hasil Produksi (Units of Production)',
    cost,
    salvageValue,
    usefulLife: yearlyActualUnits.length,
    schedule,
    totalDepreciation: accumulated,
    formula: 'Beban per Unit = (Harga Perolehan − Nilai Residu) / Total Estimasi Unit; Beban Tahun Ini = Beban per Unit × Unit Aktual',
  };
}

/**
 * Interest Calculator (Bunga Sederhana & Bunga Majemuk)
 */
export interface InterestResult {
  principal: number;
  annualRatePct: number;
  periods: number;
  periodType: 'tahun' | 'bulan';
  simpleInterest: number;
  simpleTotal: number;
  compoundInterest: number;
  compoundTotal: number;
  schedule: Array<{
    period: number;
    beginningPrincipal: number;
    interestEarned: number;
    endingBalance: number;
  }>;
}

export function calculateInterest(
  principal: number,
  annualRatePct: number,
  periods: number,
  periodType: 'tahun' | 'bulan' = 'tahun',
  compoundingFrequency = 1 // 1 = per tahun, 12 = per bulan
): InterestResult {
  const r = (annualRatePct / 100) / (periodType === 'bulan' ? 12 : 1);
  const t = periods;

  // Simple Interest: P * r * t
  const simpleInterest = Math.round(principal * r * t);
  const simpleTotal = principal + simpleInterest;

  // Compound Interest: P * (1 + r)^t
  const compoundTotal = Math.round(principal * Math.pow(1 + r, t));
  const compoundInterest = compoundTotal - principal;

  const schedule: InterestResult['schedule'] = [];
  let curBal = principal;

  for (let i = 1; i <= periods; i++) {
    const beg = curBal;
    const interest = Math.round(beg * r);
    curBal = beg + interest;
    schedule.push({
      period: i,
      beginningPrincipal: beg,
      interestEarned: interest,
      endingBalance: curBal,
    });
  }

  return {
    principal,
    annualRatePct,
    periods,
    periodType,
    simpleInterest,
    simpleTotal,
    compoundInterest,
    compoundTotal,
    schedule,
  };
}

/**
 * Financial Ratios Calculator
 */
export interface FinancialRatioResult {
  name: string;
  category: 'Likuiditas' | 'Solvabilitas' | 'Profitabilitas' | 'Aktivitas';
  value: number;
  unit: string;
  formula: string;
  benchmark: string;
  status: 'sehat' | 'waspada' | 'kurang';
  interpretation: string;
}

export function calculateFinancialRatios(inputs: {
  currentAssets: number;
  inventory: number;
  cash: number;
  currentLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  revenue: number;
  costOfGoodsSold: number;
  netIncome: number;
  receivables: number;
}): FinancialRatioResult[] {
  const {
    currentAssets,
    inventory,
    cash,
    currentLiabilities,
    totalAssets,
    totalLiabilities,
    totalEquity,
    revenue,
    costOfGoodsSold,
    netIncome,
    receivables,
  } = inputs;

  const results: FinancialRatioResult[] = [];

  // 1. Current Ratio
  const currentRatio = currentLiabilities > 0 ? (currentAssets / currentLiabilities) * 100 : 0;
  results.push({
    name: 'Current Ratio (Rasio Lancar)',
    category: 'Likuiditas',
    value: Number((currentRatio / 100).toFixed(2)),
    unit: 'x',
    formula: 'Aset Lancar / Liabilitas Lancar',
    benchmark: '≥ 1.5x - 2.0x (150% - 200%)',
    status: currentRatio >= 150 ? 'sehat' : currentRatio >= 100 ? 'waspada' : 'kurang',
    interpretation:
      currentRatio >= 150
        ? 'Likuiditas sangat prima. Entitas mampu melunasi seluruh kewajiban jangka pendeknya dengan aset lancar.'
        : currentRatio >= 100
        ? 'Likuiditas pas-pasan. Perlu pengawasan ketat terhadap arus kas jangka pendek.'
        : 'Likuiditas defisit. Aset lancar tidak mencukupi untuk melunasi utang jatuh tempo segera.',
  });

  // 2. Quick Ratio (Acid-Test Ratio)
  const quickRatio = currentLiabilities > 0 ? ((currentAssets - inventory) / currentLiabilities) : 0;
  results.push({
    name: 'Quick Ratio (Rasio Cepat)',
    category: 'Likuiditas',
    value: Number(quickRatio.toFixed(2)),
    unit: 'x',
    formula: '(Aset Lancar − Persediaan) / Liabilitas Lancar',
    benchmark: '≥ 1.0x (100%)',
    status: quickRatio >= 1.0 ? 'sehat' : quickRatio >= 0.8 ? 'waspada' : 'kurang',
    interpretation:
      quickRatio >= 1.0
        ? 'Kemampuan melunasi utang lancar tanpa mengandalkan penjualan persediaan sangat kuat.'
        : 'Kemampuan membayar utang mendesak bergantung pada kelancaran penjualan persediaan.',
  });

  // 3. Debt to Equity Ratio (DER)
  const der = totalEquity > 0 ? (totalLiabilities / totalEquity) : 0;
  results.push({
    name: 'Debt to Equity Ratio (DER)',
    category: 'Solvabilitas',
    value: Number(der.toFixed(2)),
    unit: 'x',
    formula: 'Total Liabilitas / Total Ekuitas',
    benchmark: '≤ 1.0x - 1.5x',
    status: der <= 1.0 ? 'sehat' : der <= 2.0 ? 'waspada' : 'kurang',
    interpretation:
      der <= 1.0
        ? 'Struktur modal sehat dan aman. Porsi utang lebih kecil atau seimbang dengan modal sendiri.'
        : der <= 2.0
        ? 'Tingkat utang moderat. Masih dapat ditolerir untuk sektor yang padat modal.'
        : 'Leverage tinggi. Risiko solvabilitas meningkat akibat dominasi beban utang.',
  });

  // 4. Debt to Asset Ratio (DAR)
  const dar = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  results.push({
    name: 'Debt to Asset Ratio (DAR)',
    category: 'Solvabilitas',
    value: Number(dar.toFixed(1)),
    unit: '%',
    formula: '(Total Liabilitas / Total Aset) × 100%',
    benchmark: '≤ 50% - 60%',
    status: dar <= 50 ? 'sehat' : dar <= 70 ? 'waspada' : 'kurang',
    interpretation: `${dar.toFixed(1)}% dari total aset entitas dibiayai oleh utang/liabilitas.`,
  });

  // 5. Net Profit Margin (NPM)
  const npm = revenue > 0 ? (netIncome / revenue) * 100 : 0;
  results.push({
    name: 'Net Profit Margin (NPM)',
    category: 'Profitabilitas',
    value: Number(npm.toFixed(1)),
    unit: '%',
    formula: '(Laba Bersih / Pendapatan) × 100%',
    benchmark: '≥ 10% - 20%',
    status: npm >= 15 ? 'sehat' : npm > 0 ? 'waspada' : 'kurang',
    interpretation:
      npm > 0
        ? `Setiap Rp 100 pendapatan menghasilkan laba bersih sebesar ${formatCurrencyString(npm)}.`
        : 'Entitas mengalami rugi operasional bersih pada periode ini.',
  });

  // 6. Return on Assets (ROA)
  const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
  results.push({
    name: 'Return on Assets (ROA)',
    category: 'Profitabilitas',
    value: Number(roa.toFixed(1)),
    unit: '%',
    formula: '(Laba Bersih / Total Aset) × 100%',
    benchmark: '≥ 5.0%',
    status: roa >= 5.0 ? 'sehat' : roa > 0 ? 'waspada' : 'kurang',
    interpretation: `Efisiensi pemanfaatan aset dalam menghasilkan laba sebesar ${roa.toFixed(1)}%.`,
  });

  // 7. Return on Equity (ROE)
  const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
  results.push({
    name: 'Return on Equity (ROE)',
    category: 'Profitabilitas',
    value: Number(roe.toFixed(1)),
    unit: '%',
    formula: '(Laba Bersih / Total Ekuitas) × 100%',
    benchmark: '≥ 12.0%',
    status: roe >= 12.0 ? 'sehat' : roe > 0 ? 'waspada' : 'kurang',
    interpretation: `Tingkat pengembalian imbal hasil atas modal pemilik sebesar ${roe.toFixed(1)}%.`,
  });

  return results;
}

function formatCurrencyString(val: number): string {
  return `Rp ${val.toFixed(1)}`;
}
