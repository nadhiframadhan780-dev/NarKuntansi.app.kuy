import React, { useState } from 'react';
import { Search, FileSpreadsheet, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { formatRupiah } from '../utils/formatters';
import { exportSingleSheetToExcel, buildWorksheetSheet } from '../utils/excelExporter';

export const WorksheetView: React.FC = () => {
  const { worksheet, accounts, transactions, settings, standard } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');

  const { rows, totals, netIncome, isNetIncome, finalBalanced } = worksheet;

  const filteredRows = rows.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.account.name.toLowerCase().includes(term) ||
      r.account.code.toLowerCase().includes(term) ||
      r.account.category.toLowerCase().includes(term)
    );
  });

  const handleExport = () => {
    const ws = buildWorksheetSheet(accounts, transactions, settings, standard);
    exportSingleSheetToExcel('Kertas Kerja 10 Kolom', ws, `Kertas_Kerja_${settings.entityName}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
            Kertas Kerja 10 Kolom (Neraca Lajur)
          </h2>
          <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
            Lembar kerja komprehensif 10 kolom menghubungkan Neraca Saldo, Penyesuaian, NSD, Laba Rugi, dan Neraca
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#166534]" /> Ekspor Sheet
          </button>
        </div>
      </div>

      {/* Net Income Summary Card */}
      <div className="p-5 rounded-xl border border-[#E6E0D6] bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#F9F8F6] flex-shrink-0 shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#5C5852] font-editorial-sans">
              Hasil Akhir Laba / (Rugi) Bersih Periode Berjalan
            </div>
            <div className="text-xl sm:text-2xl font-bold font-editorial-serif tracking-tight text-[#1A1A1A] mt-0.5 flex items-center gap-2.5">
              <span>{formatRupiah(Math.abs(netIncome))}</span>
              <span className={`text-xs font-editorial-sans font-bold px-2.5 py-0.5 rounded border ${
                isNetIncome
                  ? 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]'
                  : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
              }`}>
                {isNetIncome ? 'LABA BERSIH (SURPLUS)' : 'RUGI BERSIH (DEFISIT)'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-editorial-sans bg-[#F9F8F6] py-2 px-3.5 rounded-lg border border-[#D3CBC0]">
          {finalBalanced ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-[#166534]">
              <CheckCircle2 className="w-4 h-4" /> Kertas Kerja 100% Seimbang (Balanced)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-bold text-[#991B1B]">
              <AlertTriangle className="w-4 h-4" /> Terdapat Selisih Penyesuaian
            </span>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E0D6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C877E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode akun atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>
        <span className="text-xs text-[#5C5852] font-editorial-sans">
          <strong className="text-[#1A1A1A]">{filteredRows.length}</strong> baris akun pada neraca lajur
        </span>
      </div>

      {/* 10-Column Worksheet Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
            {/* Super Header */}
            <thead>
              <tr className="bg-[#1A1A1A] text-[#F9F8F6] font-bold text-center border-b border-[#33302C] font-editorial-sans">
                <th rowSpan={2} className="py-2.5 px-3 w-16 border-r border-[#33302C]">Kode</th>
                <th rowSpan={2} className="py-2.5 px-4 min-w-[180px] text-left border-r border-[#33302C]">Nama Akun</th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-[#33302C] bg-[#1A1A1A]">1-2. Neraca Saldo</th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-[#33302C] bg-[#24211D]">3-4. Penyesuaian</th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-[#33302C] bg-[#1A1A1A]">5-6. NS Disesuaikan</th>
                <th colSpan={2} className="py-1.5 px-2 border-r border-[#33302C] bg-[#2A2723]">7-8. Laba Rugi</th>
                <th colSpan={2} className="py-1.5 px-2 bg-[#33302C]">9-10. Neraca</th>
              </tr>
              <tr className="bg-[#2B2824] text-[#D3CBC0] text-center font-bold text-[10px] uppercase tracking-wider border-b border-[#3E3A34] font-editorial-sans">
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34]">Debit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34]">Kredit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34]">Debit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34]">Kredit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34]">Debit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34]">Kredit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34] bg-[#22201D]">Debit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34] bg-[#22201D]">Kredit</th>
                <th className="py-1.5 px-2 w-24 border-r border-[#3E3A34] bg-[#282521]">Debit</th>
                <th className="py-1.5 px-2 w-24 bg-[#282521]">Kredit</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-[#E6E0D6] font-editorial-mono">
              {filteredRows.map((r) => (
                <tr key={r.account.id} className="hover:bg-[#FAF9F6]">
                  <td className="py-1.5 px-3 font-semibold text-[#1A1A1A] border-r border-[#E6E0D6]">{r.account.code}</td>
                  <td className="py-1.5 px-4 font-editorial-sans font-medium text-[#1A1A1A] border-r border-[#E6E0D6]">{r.account.name}</td>
                  
                  {/* Trial Balance */}
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#1A1A1A]">
                    {r.trialBalance.debit > 0 ? formatRupiah(r.trialBalance.debit) : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#1A1A1A]">
                    {r.trialBalance.credit > 0 ? formatRupiah(r.trialBalance.credit) : '-'}
                  </td>

                  {/* Adjustment */}
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#5C5852] bg-[#FAF9F6]">
                    {r.adjustment.debit > 0 ? formatRupiah(r.adjustment.debit) : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#5C5852] bg-[#FAF9F6]">
                    {r.adjustment.credit > 0 ? formatRupiah(r.adjustment.credit) : '-'}
                  </td>

                  {/* Adjusted Trial Balance */}
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#1A1A1A] font-semibold">
                    {r.adjustedTrialBalance.debit > 0 ? formatRupiah(r.adjustedTrialBalance.debit) : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#1A1A1A] font-semibold">
                    {r.adjustedTrialBalance.credit > 0 ? formatRupiah(r.adjustedTrialBalance.credit) : '-'}
                  </td>

                  {/* Income Statement */}
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#1A1A1A] bg-[#FAF9F6]">
                    {r.incomeStatement.debit > 0 ? formatRupiah(r.incomeStatement.debit) : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#1A1A1A] bg-[#FAF9F6]">
                    {r.incomeStatement.credit > 0 ? formatRupiah(r.incomeStatement.credit) : '-'}
                  </td>

                  {/* Balance Sheet */}
                  <td className="py-1.5 px-2 text-right border-r border-[#E6E0D6] text-[#1A1A1A]">
                    {r.balanceSheet.debit > 0 ? formatRupiah(r.balanceSheet.debit) : '-'}
                  </td>
                  <td className="py-1.5 px-2 text-right text-[#1A1A1A]">
                    {r.balanceSheet.credit > 0 ? formatRupiah(r.balanceSheet.credit) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Totals */}
            <tfoot>
              {/* Row 1: Subtotal */}
              <tr className="bg-[#F4F1EA] font-bold text-[#1A1A1A] border-t-2 border-[#D3CBC0]">
                <td colSpan={2} className="py-2.5 px-4 text-right uppercase tracking-wider text-[10px] font-editorial-sans border-r border-[#D3CBC0]">
                  Subtotal:
                </td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono">{formatRupiah(totals.trialBalance.debit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono">{formatRupiah(totals.trialBalance.credit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono">{formatRupiah(totals.adjustment.debit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono">{formatRupiah(totals.adjustment.credit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono">{formatRupiah(totals.adjustedTrialBalance.debit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono">{formatRupiah(totals.adjustedTrialBalance.credit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono bg-[#EFECE5]">{formatRupiah(totals.incomeStatement.debit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono bg-[#EFECE5]">{formatRupiah(totals.incomeStatement.credit)}</td>
                <td className="py-2.5 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono">{formatRupiah(totals.balanceSheet.debit)}</td>
                <td className="py-2.5 px-2 text-right font-editorial-mono">{formatRupiah(totals.balanceSheet.credit)}</td>
              </tr>

              {/* Row 2: Net Income Balancing Row */}
              <tr className="bg-[#FAF9F6] font-bold text-[#1A1A1A] border-t border-[#D3CBC0]">
                <td colSpan={2} className="py-2 px-4 text-right uppercase tracking-wider text-[10px] font-editorial-sans border-r border-[#D3CBC0]">
                  {isNetIncome ? 'Laba Bersih Periode Berjalan:' : 'Rugi Bersih Periode Berjalan:'}
                </td>
                <td colSpan={6} className="py-2 px-2 text-center text-[#8C877E] font-editorial-sans border-r border-[#D3CBC0]">
                  -
                </td>
                {/* Laba Rugi Balancing */}
                <td className="py-2 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono text-[#166534] bg-[#EFECE5]">
                  {isNetIncome ? formatRupiah(netIncome) : '-'}
                </td>
                <td className="py-2 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono text-[#991B1B] bg-[#EFECE5]">
                  {isNetIncome ? '-' : formatRupiah(Math.abs(netIncome))}
                </td>
                {/* Neraca Balancing */}
                <td className="py-2 px-2 text-right border-r border-[#D3CBC0] font-editorial-mono text-[#991B1B]">
                  {isNetIncome ? '-' : formatRupiah(Math.abs(netIncome))}
                </td>
                <td className="py-2 px-2 text-right font-editorial-mono text-[#166534]">
                  {isNetIncome ? formatRupiah(netIncome) : '-'}
                </td>
              </tr>

              {/* Row 3: Grand Total */}
              <tr className="bg-[#1A1A1A] text-[#F9F8F6] font-bold border-t-2 border-[#1A1A1A] font-editorial-mono">
                <td colSpan={2} className="py-3 px-4 text-right uppercase tracking-wider text-[10px] font-editorial-sans border-r border-[#33302C]">
                  Grand Total (Balanced):
                </td>
                <td className="py-3 px-2 text-right border-r border-[#33302C]">{formatRupiah(totals.trialBalance.debit)}</td>
                <td className="py-3 px-2 text-right border-r border-[#33302C]">{formatRupiah(totals.trialBalance.credit)}</td>
                <td className="py-3 px-2 text-right border-r border-[#33302C]">{formatRupiah(totals.adjustment.debit)}</td>
                <td className="py-3 px-2 text-right border-r border-[#33302C]">{formatRupiah(totals.adjustment.credit)}</td>
                <td className="py-3 px-2 text-right border-r border-[#33302C]">{formatRupiah(totals.adjustedTrialBalance.debit)}</td>
                <td className="py-3 px-2 text-right border-r border-[#33302C]">{formatRupiah(totals.adjustedTrialBalance.credit)}</td>
                <td className="py-3 px-2 text-right border-r border-[#33302C] text-[#86EFAC]">
                  {formatRupiah(Math.max(totals.incomeStatement.debit, totals.incomeStatement.credit))}
                </td>
                <td className="py-3 px-2 text-right border-r border-[#33302C] text-[#86EFAC]">
                  {formatRupiah(Math.max(totals.incomeStatement.debit, totals.incomeStatement.credit))}
                </td>
                <td className="py-3 px-2 text-right border-r border-[#33302C] text-[#86EFAC]">
                  {formatRupiah(Math.max(totals.balanceSheet.debit, totals.balanceSheet.credit))}
                </td>
                <td className="py-3 px-2 text-right text-[#86EFAC]">
                  {formatRupiah(Math.max(totals.balanceSheet.debit, totals.balanceSheet.credit))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
