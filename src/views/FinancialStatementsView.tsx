import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  Landmark,
  Layers,
  FileText,
  DollarSign,
  HeartHandshake,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { AccountingStandard, AccountCategory } from '../types/accounting';
import { formatRupiah } from '../utils/formatters';
import { exportAllReportsToExcel } from '../utils/excelExporter';

export const FinancialStatementsView: React.FC = () => {
  const { accounts, transactions, ledgers, settings, standard } = useAccounting();
  const [activeTab, setActiveTab] = useState<string>('income');

  // Compute Revenue & Expenses
  let totalPendapatan = 0;
  const revenueItems: Array<{ code: string; name: string; amount: number }> = [];

  let totalBeban = 0;
  const expenseItems: Array<{ code: string; name: string; amount: number }> = [];

  accounts.forEach((acc) => {
    const l = ledgers.get(acc.code);
    if (!l) return;

    if (acc.category === AccountCategory.PENDAPATAN || acc.category === AccountCategory.PENDAPATAN_LRA) {
      const bal = l.endingBalanceCredit - l.endingBalanceDebit;
      if (bal !== 0) {
        totalPendapatan += bal;
        revenueItems.push({ code: acc.code, name: acc.name, amount: bal });
      }
    } else if (acc.category === AccountCategory.BEBAN || acc.category === AccountCategory.BELANJA_LRA) {
      const bal = l.endingBalanceDebit - l.endingBalanceCredit;
      if (bal !== 0) {
        totalBeban += bal;
        expenseItems.push({ code: acc.code, name: acc.name, amount: bal });
      }
    }
  });

  const netIncome = totalPendapatan - totalBeban;
  const isProfit = netIncome >= 0;

  // Assets
  let totalAsetLancar = 0;
  const asetLancarItems: Array<{ code: string; name: string; amount: number }> = [];
  let totalAsetTetap = 0;
  const asetTetapItems: Array<{ code: string; name: string; amount: number }> = [];

  accounts
    .filter((a) => a.category === AccountCategory.ASET)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;

      const bal = acc.isContra
        ? -(l.endingBalanceCredit - l.endingBalanceDebit)
        : l.endingBalanceDebit - l.endingBalanceCredit;

      if (bal !== 0) {
        const isNonCurrent =
          acc.code.startsWith('12') ||
          acc.code.startsWith('13') ||
          acc.code.startsWith('1.3') ||
          acc.name.toLowerCase().includes('tetap') ||
          acc.name.toLowerCase().includes('peralatan') ||
          acc.name.toLowerCase().includes('akumulasi') ||
          acc.name.toLowerCase().includes('goodwill') ||
          acc.name.toLowerCase().includes('bangunan');

        if (isNonCurrent) {
          totalAsetTetap += bal;
          asetTetapItems.push({ code: acc.code, name: acc.name, amount: bal });
        } else {
          totalAsetLancar += bal;
          asetLancarItems.push({ code: acc.code, name: acc.name, amount: bal });
        }
      }
    });

  const totalAset = totalAsetLancar + totalAsetTetap;

  // Liabilities
  let totalLiabilitas = 0;
  const liabilitasItems: Array<{ code: string; name: string; amount: number }> = [];

  accounts
    .filter((a) => a.category === AccountCategory.LIABILITAS)
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;
      const bal = l.endingBalanceCredit - l.endingBalanceDebit;
      if (bal !== 0) {
        totalLiabilitas += bal;
        liabilitasItems.push({ code: acc.code, name: acc.name, amount: bal });
      }
    });

  // Equity
  let modalAwal = 0;
  let priveDividen = 0;
  const modalItems: Array<{ code: string; name: string; amount: number }> = [];

  accounts
    .filter((a) => a.category === AccountCategory.EKUITAS && a.code !== '399')
    .forEach((acc) => {
      const l = ledgers.get(acc.code);
      if (!l) return;

      const isPrive = acc.isContra || acc.name.toLowerCase().includes('prive') || acc.name.toLowerCase().includes('dividen');
      if (isPrive) {
        const bal = l.endingBalanceDebit - l.endingBalanceCredit;
        priveDividen += bal;
      } else {
        const bal = l.endingBalanceCredit - l.endingBalanceDebit;
        modalAwal += bal;
        modalItems.push({ code: acc.code, name: acc.name, amount: bal });
      }
    });

  const modalAkhir = modalAwal + netIncome - priveDividen;
  const totalLiabilitasDanEkuitas = totalLiabilitas + modalAkhir;
  const isBalanceSheetBalanced = Math.abs(totalAset - totalLiabilitasDanEkuitas) === 0;

  // Cash Flow Calculations (Direct Method)
  const kasAccounts = accounts.filter(
    (a) =>
      a.code === '101' ||
      a.code === '102' ||
      a.code === '1.1.1.01' ||
      a.name.toLowerCase().includes('kas')
  );
  const kasCodes = new Set(kasAccounts.map((a) => a.code));

  let arusKasOperasi = 0;
  let arusKasInvestasi = 0;
  let arusKasPendanaan = 0;

  transactions.forEach((tx) => {
    const hasKasDebit = tx.entries.some((e) => kasCodes.has(e.accountCode) && e.debit > 0);
    const hasKasCredit = tx.entries.some((e) => kasCodes.has(e.accountCode) && e.credit > 0);

    if (!hasKasDebit && !hasKasCredit) return;

    tx.entries.forEach((entry) => {
      if (kasCodes.has(entry.accountCode)) return;

      const otherAcc = accounts.find((a) => a.code === entry.accountCode);
      if (!otherAcc) return;

      const cashIn = entry.credit || 0;
      const cashOut = entry.debit || 0;
      const netCash = cashIn - cashOut;

      if (
        otherAcc.category === AccountCategory.PENDAPATAN ||
        otherAcc.category === AccountCategory.BEBAN ||
        otherAcc.code === '103' || // Piutang
        otherAcc.code === '105' || // Persediaan / Perlengkapan
        otherAcc.code === '201' || // Utang Usaha
        otherAcc.category === AccountCategory.PENDAPATAN_LRA ||
        otherAcc.category === AccountCategory.BELANJA_LRA
      ) {
        arusKasOperasi += netCash;
      } else if (
        otherAcc.code.startsWith('12') ||
        otherAcc.code.startsWith('13') ||
        otherAcc.code.startsWith('1.3') ||
        otherAcc.name.toLowerCase().includes('peralatan') ||
        otherAcc.name.toLowerCase().includes('mesin') ||
        otherAcc.name.toLowerCase().includes('investasi')
      ) {
        arusKasInvestasi += netCash;
      } else if (
        otherAcc.category === AccountCategory.EKUITAS ||
        otherAcc.code.startsWith('22') ||
        otherAcc.name.toLowerCase().includes('bank') ||
        otherAcc.name.toLowerCase().includes('prive') ||
        otherAcc.name.toLowerCase().includes('modal')
      ) {
        arusKasPendanaan += netCash;
      } else {
        arusKasOperasi += netCash;
      }
    });
  });

  const totalPerubahanKas = arusKasOperasi + arusKasInvestasi + arusKasPendanaan;
  const saldoKasAkhir = kasAccounts.reduce((sum, k) => {
    const l = ledgers.get(k.code);
    return sum + (l ? l.endingBalanceDebit - l.endingBalanceCredit : 0);
  }, 0);

  const handleExportAll = () => {
    exportAllReportsToExcel({
      settings,
      standard,
      accounts,
      transactions,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
            Laporan Keuangan (Financial Statements)
          </h2>
          <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
            Laporan keuangan resmi berstandar <strong>{standard}</strong> untuk entitas {settings.entityName}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportAll}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] rounded-lg transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#86EFAC]" /> Ekspor Lengkap ke Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E6E0D6] overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('income')}
          className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'income'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Laba Rugi
        </button>

        <button
          onClick={() => setActiveTab('equity')}
          className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'equity'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <Layers className="w-4 h-4" /> Perubahan Ekuitas
        </button>

        <button
          onClick={() => setActiveTab('balance')}
          className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'balance'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <Building2 className="w-4 h-4" /> Posisi Keuangan (Neraca)
        </button>

        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'cashflow'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Arus Kas
        </button>

        {standard === AccountingStandard.SAK_SYARIAH && (
          <button
            onClick={() => setActiveTab('syariah')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'syariah'
                ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
                : 'text-[#5C5852] hover:bg-[#EFECE5]'
            }`}
          >
            <HeartHandshake className="w-4 h-4" /> Dana Zakat & Kebajikan
          </button>
        )}

        {standard === AccountingStandard.SAP && (
          <button
            onClick={() => setActiveTab('sap')}
            className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'sap'
                ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
                : 'text-[#5C5852] hover:bg-[#EFECE5]'
            }`}
          >
            <Landmark className="w-4 h-4" /> LRA & LO
          </button>
        )}

        <button
          onClick={() => setActiveTab('calk')}
          className={`px-3.5 py-2 rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'calk'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <FileText className="w-4 h-4" /> Ringkasan CALK
        </button>
      </div>

      {/* TAB CONTENT: 1. LABA RUGI */}
      {activeTab === 'income' && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          {/* Masthead Header */}
          <div className="text-center pb-5 border-b border-[#E6E0D6]">
            <h3 className="text-sm font-semibold tracking-wider text-[#5C5852] uppercase font-editorial-sans">
              {settings.entityName}
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif mt-1">
              {standard === AccountingStandard.PSAK ? 'Laporan Laba Rugi dan Penghasilan Komprehensif Lain' : 'Laporan Laba Rugi'}
            </h4>
            <p className="text-xs text-[#8C877E] mt-1 font-editorial-sans">
              Untuk Periode yang Berakhir pada {settings.periodEnd} • Dinyatakan dalam Rupiah (IDR)
            </p>
          </div>

          {/* Revenue */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider bg-[#F4F1EA] px-3 py-1.5 rounded font-editorial-sans">
              Pendapatan Usaha
            </div>
            <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs sm:text-sm">
              {revenueItems.length === 0 ? (
                <div className="py-2 px-3 text-[#8C877E] font-editorial-sans italic">Tidak ada akun pendapatan</div>
              ) : (
                revenueItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 px-3">
                    <span className="font-editorial-sans text-[#1A1A1A]">{item.name}</span>
                    <span className="font-medium text-[#1A1A1A]">{formatRupiah(item.amount)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between py-2 px-3 font-bold border-t border-[#D3CBC0] text-[#1A1A1A] bg-[#FAF9F6] rounded">
              <span className="font-editorial-sans">Total Pendapatan</span>
              <span className="font-editorial-mono text-[#1A1A1A]">{formatRupiah(totalPendapatan)}</span>
            </div>
          </div>

          {/* Expenses */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider bg-[#F4F1EA] px-3 py-1.5 rounded font-editorial-sans">
              Beban Operasional
            </div>
            <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs sm:text-sm">
              {expenseItems.length === 0 ? (
                <div className="py-2 px-3 text-[#8C877E] font-editorial-sans italic">Tidak ada akun beban</div>
              ) : (
                expenseItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2 px-3">
                    <span className="font-editorial-sans text-[#1A1A1A]">{item.name}</span>
                    <span className="font-medium text-[#1A1A1A]">{formatRupiah(item.amount)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-between py-2 px-3 font-bold border-t border-[#D3CBC0] text-[#1A1A1A] bg-[#FAF9F6] rounded">
              <span className="font-editorial-sans">Total Beban Operasional</span>
              <span className="font-editorial-mono text-[#991B1B]">{formatRupiah(totalBeban)}</span>
            </div>
          </div>

          {/* Net Profit / Loss */}
          <div className="p-5 rounded-xl bg-[#1A1A1A] text-[#F9F8F6] flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs text-[#D3CBC0] uppercase tracking-wider block font-editorial-sans">
                {isProfit ? 'Laba Bersih Tahun / Periode Berjalan' : 'Rugi Bersih Tahun / Periode Berjalan'}
              </span>
              <span className="text-xs text-[#8C877E] font-editorial-sans">
                (Total Pendapatan − Total Beban)
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-editorial-mono font-bold text-[#86EFAC]">
              {formatRupiah(netIncome)}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. PERUBAHAN EKUITAS */}
      {activeTab === 'equity' && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-5 border-b border-[#E6E0D6]">
            <h3 className="text-sm font-semibold tracking-wider text-[#5C5852] uppercase font-editorial-sans">
              {settings.entityName}
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif mt-1">
              Laporan Perubahan Ekuitas
            </h4>
            <p className="text-xs text-[#8C877E] mt-1 font-editorial-sans">
              Untuk Periode yang Berakhir pada {settings.periodEnd}
            </p>
          </div>

          <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs sm:text-sm">
            <div className="flex justify-between py-2.5 px-3">
              <span className="font-editorial-sans font-medium text-[#1A1A1A]">Modal Awal / Saldo Awal Ekuitas</span>
              <span className="font-medium text-[#1A1A1A]">{formatRupiah(modalAwal)}</span>
            </div>
            <div className="flex justify-between py-2.5 px-3">
              <span className="font-editorial-sans font-medium text-[#1A1A1A]">
                {isProfit ? 'Laba Bersih Periode Berjalan (+)' : 'Rugi Bersih Periode Berjalan (−)'}
              </span>
              <span className={`font-medium ${isProfit ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                {formatRupiah(netIncome)}
              </span>
            </div>
            {priveDividen > 0 && (
              <div className="flex justify-between py-2.5 px-3">
                <span className="font-editorial-sans font-medium text-[#1A1A1A]">Pengambilan Pribadi (Prive / Dividen) (−)</span>
                <span className="font-medium text-[#991B1B]">({formatRupiah(priveDividen)})</span>
              </div>
            )}
            <div className="flex justify-between py-3 px-3 font-bold text-sm sm:text-base bg-[#F4F1EA] rounded-lg text-[#1A1A1A] border-t-2 border-[#1A1A1A] accounting-total-border">
              <span className="font-editorial-sans">Modal Akhir / Saldo Akhir Ekuitas</span>
              <span className="text-[#1A1A1A]">{formatRupiah(modalAkhir)}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. POSISI KEUANGAN (NERACA) */}
      {activeTab === 'balance' && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
          <div className="text-center pb-5 border-b border-[#E6E0D6]">
            <h3 className="text-sm font-semibold tracking-wider text-[#5C5852] uppercase font-editorial-sans">
              {settings.entityName}
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif mt-1">
              Laporan Posisi Keuangan (Neraca)
            </h4>
            <p className="text-xs text-[#8C877E] mt-1 font-editorial-sans">Per {settings.periodEnd}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SISI KIRI: ASET */}
            <div className="space-y-4">
              <div className="bg-[#1A1A1A] text-[#F9F8F6] font-bold px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider flex justify-between font-editorial-sans">
                <span>ASET (AKTIVA)</span>
                <span className="font-editorial-mono">{formatRupiah(totalAset)}</span>
              </div>

              {/* Aset Lancar */}
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] uppercase bg-[#F4F1EA] px-3 py-1.5 rounded font-editorial-sans">
                  Aset Lancar
                </div>
                <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs">
                  {asetLancarItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 px-3">
                      <span className="font-editorial-sans text-[#1A1A1A]">{item.name}</span>
                      <span className="font-medium text-[#1A1A1A]">{formatRupiah(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 px-3 font-bold bg-[#FAF9F6]">
                    <span className="font-editorial-sans">Subtotal Aset Lancar</span>
                    <span>{formatRupiah(totalAsetLancar)}</span>
                  </div>
                </div>
              </div>

              {/* Aset Tidak Lancar / Tetap */}
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] uppercase bg-[#F4F1EA] px-3 py-1.5 rounded font-editorial-sans">
                  Aset Tidak Lancar / Tetap
                </div>
                <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs">
                  {asetTetapItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 px-3">
                      <span className="font-editorial-sans text-[#1A1A1A]">{item.name}</span>
                      <span className="font-medium text-[#1A1A1A]">{formatRupiah(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 px-3 font-bold bg-[#FAF9F6]">
                    <span className="font-editorial-sans">Subtotal Aset Tidak Lancar</span>
                    <span>{formatRupiah(totalAsetTetap)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SISI KANAN: LIABILITAS & EKUITAS */}
            <div className="space-y-4">
              <div className="bg-[#24211D] text-[#F9F8F6] font-bold px-3.5 py-2 rounded-lg text-xs uppercase tracking-wider flex justify-between font-editorial-sans">
                <span>LIABILITAS & EKUITAS</span>
                <span className="font-editorial-mono">{formatRupiah(totalLiabilitasDanEkuitas)}</span>
              </div>

              {/* Liabilitas */}
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] uppercase bg-[#F4F1EA] px-3 py-1.5 rounded font-editorial-sans">
                  Liabilitas (Kewajiban)
                </div>
                <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs">
                  {liabilitasItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 px-3">
                      <span className="font-editorial-sans text-[#1A1A1A]">{item.name}</span>
                      <span className="font-medium text-[#1A1A1A]">{formatRupiah(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 px-3 font-bold bg-[#FAF9F6]">
                    <span className="font-editorial-sans">Total Liabilitas</span>
                    <span>{formatRupiah(totalLiabilitas)}</span>
                  </div>
                </div>
              </div>

              {/* Ekuitas */}
              <div>
                <div className="text-xs font-bold text-[#1A1A1A] uppercase bg-[#F4F1EA] px-3 py-1.5 rounded font-editorial-sans">
                  Ekuitas (Modal)
                </div>
                <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs">
                  {modalItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 px-3">
                      <span className="font-editorial-sans text-[#1A1A1A]">{item.name}</span>
                      <span className="font-medium text-[#1A1A1A]">{formatRupiah(item.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-1.5 px-3">
                    <span className="font-editorial-sans text-[#1A1A1A]">Laba / (Rugi) Periode Berjalan</span>
                    <span className="font-medium text-[#166534]">{formatRupiah(netIncome)}</span>
                  </div>
                  {priveDividen > 0 && (
                    <div className="flex justify-between py-1.5 px-3">
                      <span className="font-editorial-sans text-[#1A1A1A]">Prive / Dividen</span>
                      <span className="font-medium text-[#991B1B]">({formatRupiah(priveDividen)})</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1.5 px-3 font-bold bg-[#FAF9F6]">
                    <span className="font-editorial-sans">Total Ekuitas</span>
                    <span>{formatRupiah(modalAkhir)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Check Footer */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between font-editorial-sans ${
              isBalanceSheetBalanced
                ? 'bg-[#F4FBF7] border-[#BBF7D0] text-[#166534]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold">
              {isBalanceSheetBalanced ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#166534]" />
                  <span>Neraca 100% Seimbang: Total Aset = Total Liabilitas + Ekuitas</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-[#991B1B]" />
                  <span>
                    Neraca Tidak Seimbang — Selisih Rp {Math.abs(totalAset - totalLiabilitasDanEkuitas).toLocaleString('id-ID')}
                  </span>
                </>
              )}
            </div>
            <span className="font-editorial-mono text-sm font-bold">{formatRupiah(totalAset)}</span>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. ARUS KAS */}
      {activeTab === 'cashflow' && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-5 border-b border-[#E6E0D6]">
            <h3 className="text-sm font-semibold tracking-wider text-[#5C5852] uppercase font-editorial-sans">
              {settings.entityName}
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif mt-1">
              Laporan Arus Kas (Metode Langsung)
            </h4>
            <p className="text-xs text-[#8C877E] mt-1 font-editorial-sans">
              Untuk Periode yang Berakhir pada {settings.periodEnd}
            </p>
          </div>

          <div className="space-y-4 font-editorial-mono text-xs sm:text-sm">
            {/* Aktivitas Operasi */}
            <div>
              <div className="font-editorial-sans font-bold text-[#1A1A1A] uppercase bg-[#F4F1EA] px-3 py-1.5 rounded">
                Arus Kas dari Aktivitas Operasi
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-editorial-sans text-[#1A1A1A]">Arus Kas Bersih yang Dihasilkan dari Aktivitas Operasi</span>
                <span className={`font-semibold ${arusKasOperasi >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                  {formatRupiah(arusKasOperasi)}
                </span>
              </div>
            </div>

            {/* Aktivitas Investasi */}
            <div>
              <div className="font-editorial-sans font-bold text-[#1A1A1A] uppercase bg-[#F4F1EA] px-3 py-1.5 rounded">
                Arus Kas dari Aktivitas Investasi
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-editorial-sans text-[#1A1A1A]">Arus Kas Bersih yang Digunakan untuk Aktivitas Investasi</span>
                <span className={`font-semibold ${arusKasInvestasi >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                  {formatRupiah(arusKasInvestasi)}
                </span>
              </div>
            </div>

            {/* Aktivitas Pendanaan */}
            <div>
              <div className="font-editorial-sans font-bold text-[#1A1A1A] uppercase bg-[#F4F1EA] px-3 py-1.5 rounded">
                Arus Kas dari Aktivitas Pendanaan
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-editorial-sans text-[#1A1A1A]">Arus Kas Bersih dari Aktivitas Pendanaan</span>
                <span className={`font-semibold ${arusKasPendanaan >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}`}>
                  {formatRupiah(arusKasPendanaan)}
                </span>
              </div>
            </div>

            {/* Rekonsiliasi Kas */}
            <div className="border-t-2 border-[#D3CBC0] pt-3 space-y-2 bg-[#F4F1EA] p-4 rounded-xl accounting-total-border">
              <div className="flex justify-between font-bold">
                <span className="font-editorial-sans text-[#1A1A1A]">Kenaikan / (Penurunan) Bersih Kas</span>
                <span className={totalPerubahanKas >= 0 ? 'text-[#166534]' : 'text-[#991B1B]'}>
                  {formatRupiah(totalPerubahanKas)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm sm:text-base text-[#1A1A1A] border-t border-[#D3CBC0] pt-2">
                <span className="font-editorial-sans">Saldo Kas dan Setara Kas Akhir Periode</span>
                <span className="text-[#1A1A1A]">{formatRupiah(saldoKasAkhir)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. SYARIAH */}
      {activeTab === 'syariah' && standard === AccountingStandard.SAK_SYARIAH && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-5 border-b border-[#E6E0D6]">
            <h3 className="text-sm font-semibold tracking-wider text-[#5C5852] uppercase font-editorial-sans">
              {settings.entityName}
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif mt-1">
              Laporan Sumber dan Penyaluran Dana Zakat & Dana Kebajikan
            </h4>
            <p className="text-xs text-[#8C877E] mt-1 font-editorial-sans">Sesuai Kerangka SAK Syariah</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E6E0D6]">
              <h5 className="font-bold text-sm text-[#1A1A1A] mb-2 font-editorial-serif">Sumber Dana Zakat & Kebajikan:</h5>
              <p className="text-xs text-[#5C5852] leading-relaxed font-editorial-sans">
                Penerimaan zakat dari internal entitas dan eksternal muzakki dicatat secara amanah pada rekening terpisah sesuai prinsip syariah.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 6. SAP (PEMERINTAHAN) */}
      {activeTab === 'sap' && standard === AccountingStandard.SAP && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-5 border-b border-[#E6E0D6]">
            <h3 className="text-sm font-semibold tracking-wider text-[#5C5852] uppercase font-editorial-sans">
              {settings.entityName}
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif mt-1">
              Laporan Realisasi Anggaran (LRA) & Laporan Operasional (LO)
            </h4>
            <p className="text-xs text-[#8C877E] mt-1 font-editorial-sans">Sesuai PP No. 71 Tahun 2010 (SAP Berbasis Akrual)</p>
          </div>

          <div className="space-y-4 text-xs font-editorial-sans">
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E6E0D6]">
              <span className="font-bold text-[#1A1A1A] block mb-1 font-editorial-serif text-sm">Dual System Accounting:</span>
              <p className="text-[#5C5852] leading-relaxed">
                LRA mencatat pendapatan dan belanja berbasis kas untuk pertanggungjawaban APBD/APBN, sementara LO mencatat pendapatan-LO dan beban berbasis akrual.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7. RINGKASAN CALK */}
      {activeTab === 'calk' && (
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-5 border-b border-[#E6E0D6]">
            <h3 className="text-sm font-semibold tracking-wider text-[#5C5852] uppercase font-editorial-sans">
              {settings.entityName}
            </h3>
            <h4 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif mt-1">
              Catatan Atas Laporan Keuangan (CALK)
            </h4>
            <p className="text-xs text-[#8C877E] mt-1 font-editorial-sans">Ringkasan Kebijakan Akuntansi dan Penjelasan Pos-Pos Signifikan</p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#1A1A1A] leading-relaxed font-editorial-sans">
            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E6E0D6] space-y-2">
              <h5 className="font-bold text-[#1A1A1A] font-editorial-serif text-sm sm:text-base">1. Informasi Umum Entitas</h5>
              <p className="text-[#5C5852]">
                <strong>{settings.entityName}</strong> adalah entitas yang berdomisili di {settings.address}. Laporan keuangan ini disusun dengan menerapkan standar <strong>{standard}</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E6E0D6] space-y-2">
              <h5 className="font-bold text-[#1A1A1A] font-editorial-serif text-sm sm:text-base">2. Dasar Penyusunan & Kepatuhan Standar</h5>
              <p className="text-[#5C5852]">
                Laporan keuangan disusun atas dasar akrual dengan konsep biaya historis. Mata uang pelaporan yang digunakan adalah Rupiah (IDR).
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F6] rounded-xl border border-[#E6E0D6] space-y-2">
              <h5 className="font-bold text-[#1A1A1A] font-editorial-serif text-sm sm:text-base">3. Pengesahan Laporan</h5>
              <div className="grid grid-cols-2 gap-4 pt-3 font-editorial-sans text-xs">
                <div>
                  <span className="text-[#8C877E] block">Disiapkan Oleh:</span>
                  <span className="font-bold text-[#1A1A1A] font-editorial-serif text-sm">{settings.preparedBy}</span>
                </div>
                <div>
                  <span className="text-[#8C877E] block">Disetujui Oleh:</span>
                  <span className="font-bold text-[#1A1A1A] font-editorial-serif text-sm">{settings.approvedBy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
