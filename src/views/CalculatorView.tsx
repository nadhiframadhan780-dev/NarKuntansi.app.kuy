import React, { useState } from 'react';
import {
  Percent,
  TrendingDown,
  Scale,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  calculateStraightLineDepreciation,
  calculateDecliningBalanceDepreciation,
  calculateSumOfYearsDigitsDepreciation,
  calculateInterest,
  calculateFinancialRatios,
  DepreciationResult,
} from '../utils/calculators';
import { formatRupiah } from '../utils/formatters';

export const CalculatorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'depreciation' | 'interest' | 'equation' | 'ratios'>('depreciation');

  // 1. Depreciation States
  const [depCost, setDepCost] = useState<number>(50000000);
  const [depSalvage, setDepSalvage] = useState<number>(5000000);
  const [depLife, setDepLife] = useState<number>(5);
  const [depMethod, setDepMethod] = useState<'straight' | 'double' | 'syd'>('straight');

  // 2. Interest States
  const [intPrincipal, setIntPrincipal] = useState<number>(100000000);
  const [intRate, setIntRate] = useState<number>(12);
  const [intPeriods, setIntPeriods] = useState<number>(3);
  const [intType, setIntType] = useState<'tahun' | 'bulan'>('tahun');

  // 3. Accounting Equation States
  const [eqAssets, setEqAssets] = useState<number>(250000000);
  const [eqLiabilities, setEqLiabilities] = useState<number>(80000000);
  const [eqEquity, setEqEquity] = useState<number>(170000000);

  // 4. Financial Ratios States
  const [ratioCurrentAssets, setRatioCurrentAssets] = useState<number>(120000000);
  const [ratioInventory, setRatioInventory] = useState<number>(30000000);
  const [ratioCurrentLiab, setRatioCurrentLiab] = useState<number>(60000000);
  const [ratioTotalAssets, setRatioTotalAssets] = useState<number>(300000000);
  const [ratioTotalLiab, setRatioTotalLiab] = useState<number>(100000000);
  const [ratioTotalEquity, setRatioTotalEquity] = useState<number>(200000000);
  const [ratioRevenue, setRatioRevenue] = useState<number>(250000000);
  const [ratioNetIncome, setRatioNetIncome] = useState<number>(45000000);

  // Computed Depreciation Result
  let depResult: DepreciationResult;
  if (depMethod === 'double') {
    depResult = calculateDecliningBalanceDepreciation(depCost, depSalvage, depLife, 2);
  } else if (depMethod === 'syd') {
    depResult = calculateSumOfYearsDigitsDepreciation(depCost, depSalvage, depLife);
  } else {
    depResult = calculateStraightLineDepreciation(depCost, depSalvage, depLife);
  }

  // Computed Interest Result
  const interestResult = calculateInterest(intPrincipal, intRate, intPeriods, intType);

  // Computed Equation
  const eqDifference = Math.abs(eqAssets - (eqLiabilities + eqEquity));
  const isEqBalanced = eqDifference === 0;

  // Computed Financial Ratios
  const ratioResults = calculateFinancialRatios({
    currentAssets: ratioCurrentAssets,
    inventory: ratioInventory,
    cash: 40000000,
    currentLiabilities: ratioCurrentLiab,
    totalAssets: ratioTotalAssets,
    totalLiabilities: ratioTotalLiab,
    totalEquity: ratioTotalEquity,
    revenue: ratioRevenue,
    costOfGoodsSold: 120000000,
    netIncome: ratioNetIncome,
    receivables: 25000000,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
          Kalkulator Akuntansi & Finansial Interaktif
        </h2>
        <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
          Alat hitung terintegrasi untuk simulasi penyusutan aset tetap, bunga majemuk, persamaan akuntansi, dan rasio keuangan
        </p>
      </div>

      {/* Calculator Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E0D6] overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('depreciation')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'depreciation'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <TrendingDown className="w-4 h-4" /> Penyusutan Aset Tetap
        </button>

        <button
          onClick={() => setActiveTab('interest')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'interest'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <Percent className="w-4 h-4" /> Bunga & Nilai Waktu Uang
        </button>

        <button
          onClick={() => setActiveTab('equation')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'equation'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <Scale className="w-4 h-4" /> Persamaan Dasar Akuntansi
        </button>

        <button
          onClick={() => setActiveTab('ratios')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'ratios'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <Activity className="w-4 h-4" /> Analisis Rasio Keuangan
        </button>
      </div>

      {/* 1. PENYUSUTAN */}
      {activeTab === 'depreciation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-editorial-sans">
          {/* Controls */}
          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E6E0D6] shadow-xs space-y-4 text-xs sm:text-sm">
            <h3 className="font-bold text-base text-[#1A1A1A] font-editorial-serif border-b border-[#E6E0D6] pb-2">
              Parameter Aset Tetap
            </h3>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Metode Penyusutan</label>
              <select
                value={depMethod}
                onChange={(e) => setDepMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-medium text-[#1A1A1A]"
              >
                <option value="straight">Garis Lurus (Straight-Line)</option>
                <option value="double">Saldo Menurun Ganda (Double Declining)</option>
                <option value="syd">Jumlah Angka Tahun (Sum-of-Years)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Harga Perolehan (Cost)</label>
              <input
                type="number"
                value={depCost}
                onChange={(e) => setDepCost(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-editorial-mono text-[#1A1A1A]"
              />
              <span className="text-[11px] text-[#5C5852] font-editorial-mono mt-1 block">
                {formatRupiah(depCost)}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Nilai Residu / Sisa (Salvage)</label>
              <input
                type="number"
                value={depSalvage}
                onChange={(e) => setDepSalvage(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-editorial-mono text-[#1A1A1A]"
              />
              <span className="text-[11px] text-[#5C5852] font-editorial-mono mt-1 block">
                {formatRupiah(depSalvage)}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Umur Manfaat (Tahun)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={depLife}
                onChange={(e) => setDepLife(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-editorial-mono text-[#1A1A1A]"
              />
            </div>

            <div className="p-3 bg-[#F4F1EA] rounded-lg border border-[#D3CBC0] text-xs text-[#1A1A1A]">
              <span className="font-bold block mb-1 font-editorial-serif">Rumus Perhitungan:</span>
              <p className="font-editorial-mono text-[11px] leading-relaxed text-[#5C5852]">{depResult.formula}</p>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="lg:col-span-2 bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-[#F4F1EA] border-b border-[#D3CBC0] flex justify-between items-center">
              <div>
                <h4 className="font-bold text-sm text-[#1A1A1A] font-editorial-serif">
                  Jadwal Amortisasi & Penyusutan ({depResult.method})
                </h4>
                <span className="text-xs text-[#5C5852] font-editorial-sans">
                  Total Akumulasi Penyusutan: <strong className="font-editorial-mono text-[#1A1A1A]">{formatRupiah(depResult.totalDepreciation)}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F9F8F6] border-b border-[#E6E0D6] text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider font-editorial-sans">
                    <th className="py-2.5 px-3 text-center w-16">Tahun</th>
                    <th className="py-2.5 px-3 text-right">Nilai Buku Awal</th>
                    <th className="py-2.5 px-3 text-right">Beban Penyusutan</th>
                    <th className="py-2.5 px-3 text-right">Akumulasi Penyusutan</th>
                    <th className="py-2.5 px-3 text-right">Nilai Buku Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D6] font-editorial-mono">
                  {depResult.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-[#FAF9F6]">
                      <td className="py-2 px-3 text-center font-bold text-[#1A1A1A] font-editorial-sans">
                        Tahun {row.year}
                      </td>
                      <td className="py-2 px-3 text-right">{formatRupiah(row.beginningBookValue)}</td>
                      <td className="py-2 px-3 text-right font-medium text-[#991B1B] bg-[#FEF2F2]">
                        {formatRupiah(row.depreciationExpense)}
                      </td>
                      <td className="py-2 px-3 text-right text-[#5C5852]">
                        {formatRupiah(row.accumulatedDepreciation)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-[#1A1A1A] bg-[#F4F1EA]">
                        {formatRupiah(row.endingBookValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. BUNGA */}
      {activeTab === 'interest' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-editorial-sans">
          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E6E0D6] shadow-xs space-y-4 text-xs sm:text-sm">
            <h3 className="font-bold text-base text-[#1A1A1A] font-editorial-serif border-b border-[#E6E0D6] pb-2">
              Simulasi Bunga Pinjaman / Investasi
            </h3>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Pokok Pinjaman / Modal Awal (Principal)</label>
              <input
                type="number"
                value={intPrincipal}
                onChange={(e) => setIntPrincipal(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-editorial-mono text-[#1A1A1A]"
              />
              <span className="text-[11px] text-[#5C5852] font-editorial-mono mt-1 block">
                {formatRupiah(intPrincipal)}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Suku Bunga per Tahun (%)</label>
              <input
                type="number"
                step="0.1"
                value={intRate}
                onChange={(e) => setIntRate(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-editorial-mono text-[#1A1A1A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Jangka Waktu</label>
                <input
                  type="number"
                  min={1}
                  value={intPeriods}
                  onChange={(e) => setIntPeriods(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-editorial-mono text-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Satuan</label>
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                >
                  <option value="tahun">Tahun</option>
                  <option value="bulan">Bulan</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E6E0D6] shadow-xs">
                <span className="text-xs font-bold text-[#5C5852] uppercase tracking-wider block font-editorial-sans">
                  Bunga Sederhana (Simple Interest)
                </span>
                <div className="text-2xl font-bold font-editorial-mono text-[#1A1A1A] mt-2">
                  {formatRupiah(interestResult.simpleInterest)}
                </div>
                <span className="text-xs text-[#5C5852] mt-1 block">
                  Total Nilai Akhir: <strong className="font-editorial-mono text-[#1A1A1A]">{formatRupiah(interestResult.simpleTotal)}</strong>
                </span>
              </div>

              <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E6E0D6] shadow-xs">
                <span className="text-xs font-bold text-[#5C5852] uppercase tracking-wider block font-editorial-sans">
                  Bunga Majemuk (Compound Interest)
                </span>
                <div className="text-2xl font-bold font-editorial-mono text-[#1A1A1A] mt-2">
                  {formatRupiah(interestResult.compoundInterest)}
                </div>
                <span className="text-xs text-[#5C5852] mt-1 block">
                  Total Nilai Akhir: <strong className="font-editorial-mono text-[#1A1A1A]">{formatRupiah(interestResult.compoundTotal)}</strong>
                </span>
              </div>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
              <div className="p-3.5 bg-[#F4F1EA] border-b border-[#D3CBC0] font-bold text-xs text-[#1A1A1A] uppercase font-editorial-sans">
                Tabel Akumulasi Bunga Majemuk per Periode
              </div>
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left border-collapse text-xs font-editorial-mono">
                  <thead>
                    <tr className="bg-[#F9F8F6] text-[#1A1A1A] font-bold uppercase text-[10px] font-editorial-sans">
                      <th className="py-2 px-3 text-center">Periode</th>
                      <th className="py-2 px-3 text-right">Saldo Awal</th>
                      <th className="py-2 px-3 text-right">Bunga Diperoleh</th>
                      <th className="py-2 px-3 text-right">Saldo Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E0D6]">
                    {interestResult.schedule.map((s) => (
                      <tr key={s.period} className="hover:bg-[#FAF9F6]">
                        <td className="py-2 px-3 text-center font-editorial-sans font-bold text-[#1A1A1A]">
                          {s.period}
                        </td>
                        <td className="py-2 px-3 text-right">{formatRupiah(s.beginningPrincipal)}</td>
                        <td className="py-2 px-3 text-right text-[#166534]">
                          +{formatRupiah(s.interestEarned)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#1A1A1A] bg-[#FAF9F6]">
                          {formatRupiah(s.endingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PERSAMAAN AKUNTANSI */}
      {activeTab === 'equation' && (
        <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E6E0D6] shadow-xs max-w-4xl mx-auto space-y-6 font-editorial-sans">
          <div className="text-center pb-4 border-b border-[#E6E0D6]">
            <h3 className="text-xl font-bold text-[#1A1A1A] font-editorial-serif">
              Visualisasi Persamaan Dasar Akuntansi
            </h3>
            <p className="text-xs text-[#5C5852] mt-1">
              Prinsip fundamental akuntansi berpasangan: Aset = Liabilitas + Ekuitas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#F4F1EA] rounded-xl border border-[#D3CBC0]">
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Aset (Aktiva)
              </label>
              <input
                type="number"
                value={eqAssets}
                onChange={(e) => setEqAssets(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D3CBC0] rounded-lg font-editorial-mono text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
              <span className="text-xs font-medium font-editorial-mono text-[#5C5852] mt-1 block">
                {formatRupiah(eqAssets)}
              </span>
            </div>

            <div className="p-4 bg-[#F4F1EA] rounded-xl border border-[#D3CBC0]">
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Liabilitas (Kewajiban)
              </label>
              <input
                type="number"
                value={eqLiabilities}
                onChange={(e) => setEqLiabilities(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D3CBC0] rounded-lg font-editorial-mono text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
              <span className="text-xs font-medium font-editorial-mono text-[#5C5852] mt-1 block">
                {formatRupiah(eqLiabilities)}
              </span>
            </div>

            <div className="p-4 bg-[#F4F1EA] rounded-xl border border-[#D3CBC0]">
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                Ekuitas (Modal)
              </label>
              <input
                type="number"
                value={eqEquity}
                onChange={(e) => setEqEquity(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D3CBC0] rounded-lg font-editorial-mono text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
              <span className="text-xs font-medium font-editorial-mono text-[#5C5852] mt-1 block">
                {formatRupiah(eqEquity)}
              </span>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isEqBalanced
                ? 'bg-[#F4FBF7] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold">
              {isEqBalanced ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#166534]" />
                  <span>Persamaan Akuntansi Terverifikasi Seimbang (Balanced)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-[#991B1B]" />
                  <span>
                    Tidak Seimbang — Selisih Sebesar {formatRupiah(eqDifference)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. RASIO KEUANGAN */}
      {activeTab === 'ratios' && (
        <div className="space-y-6 font-editorial-sans">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FFFFFF] p-4 rounded-xl border border-[#E6E0D6] text-xs">
            <div>
              <span className="text-[#5C5852] block font-medium">Aset Lancar:</span>
              <input
                type="number"
                value={ratioCurrentAssets}
                onChange={(e) => setRatioCurrentAssets(Number(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#D3CBC0] rounded font-editorial-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
            <div>
              <span className="text-[#5C5852] block font-medium">Liabilitas Lancar:</span>
              <input
                type="number"
                value={ratioCurrentLiab}
                onChange={(e) => setRatioCurrentLiab(Number(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#D3CBC0] rounded font-editorial-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
            <div>
              <span className="text-[#5C5852] block font-medium">Total Aset:</span>
              <input
                type="number"
                value={ratioTotalAssets}
                onChange={(e) => setRatioTotalAssets(Number(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#D3CBC0] rounded font-editorial-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
            <div>
              <span className="text-[#5C5852] block font-medium">Laba Bersih:</span>
              <input
                type="number"
                value={ratioNetIncome}
                onChange={(e) => setRatioNetIncome(Number(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-[#F9F8F6] border border-[#D3CBC0] rounded font-editorial-mono font-bold text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratioResults.map((r, idx) => (
              <div key={idx} className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E6E0D6] shadow-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C877E]">
                      {r.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#1A1A1A] font-editorial-serif">{r.name}</h4>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      r.status === 'sehat'
                        ? 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]'
                        : r.status === 'waspada'
                        ? 'bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]'
                        : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                    }`}
                  >
                    {r.status === 'sehat' ? 'Sehat ✓' : r.status === 'waspada' ? 'Waspada ⚠' : 'Kurang ✗'}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-editorial-mono text-[#1A1A1A]">
                    {r.value} {r.unit}
                  </span>
                  <span className="text-xs text-[#8C877E]">Benchmark: {r.benchmark}</span>
                </div>

                <p className="text-xs text-[#5C5852] leading-relaxed">{r.interpretation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
