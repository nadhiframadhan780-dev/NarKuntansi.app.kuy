import React, { useState } from 'react';
import { Search, FileSpreadsheet, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { BalanceIndicator } from '../components/BalanceIndicator';
import { formatRupiah } from '../utils/formatters';
import { exportSingleSheetToExcel, buildTrialBalanceSheet } from '../utils/excelExporter';

export const TrialBalanceView: React.FC = () => {
  const { trialBalance, accounts, transactions, settings, standard } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = trialBalance.items.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.account.name.toLowerCase().includes(term) ||
      item.account.code.toLowerCase().includes(term) ||
      item.account.category.toLowerCase().includes(term)
    );
  });

  const handleExport = () => {
    const ws = buildTrialBalanceSheet(accounts, transactions, settings, standard);
    exportSingleSheetToExcel('Neraca Saldo', ws, `Neraca_Saldo_${settings.entityName}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
            Neraca Saldo (Trial Balance)
          </h2>
          <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
            Daftar saldo akhir seluruh akun buku besar untuk menguji keseimbangan matematis posisi Debit dan Kredit
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

      {/* Balance Indicator Status Banner */}
      <BalanceIndicator
        isBalanced={trialBalance.isBalanced}
        difference={trialBalance.difference}
        totalDebit={trialBalance.totalDebit}
        totalCredit={trialBalance.totalCredit}
        label="Keseimbangan Neraca Saldo"
      />

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E0D6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C877E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode akun, nama, atau kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>
        <span className="text-xs text-[#5C5852] font-editorial-sans">
          Menampilkan <strong className="text-[#1A1A1A]">{filteredItems.length}</strong> akun
        </span>
      </div>

      {/* Trial Balance Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#F4F1EA] border-b border-[#D3CBC0] text-[#1A1A1A] font-bold uppercase text-[11px] tracking-wider font-editorial-sans">
                <th className="py-3 px-4 w-28">Kode Akun</th>
                <th className="py-3 px-4">Nama Akun</th>
                <th className="py-3 px-4 w-44">Kategori Akun</th>
                <th className="py-3 px-4 w-44 text-right">Debit (Rp)</th>
                <th className="py-3 px-4 w-44 text-right">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs sm:text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8C877E] font-editorial-serif">
                    Tidak ada akun yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.account.id} className="hover:bg-[#FAF9F6]">
                    <td className="py-2.5 px-4 font-semibold text-[#1A1A1A]">{item.account.code}</td>
                    <td className="py-2.5 px-4 font-editorial-sans font-medium text-[#1A1A1A]">
                      {item.account.name}
                    </td>
                    <td className="py-2.5 px-4 font-editorial-sans text-xs text-[#5C5852]">
                      <span className="bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E6E0D6] text-[#5C5852]">
                        {item.account.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-[#1A1A1A]">
                      {item.debit > 0 ? formatRupiah(item.debit) : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-[#1A1A1A]">
                      {item.credit > 0 ? formatRupiah(item.credit) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-[#F4F1EA] font-bold text-[#1A1A1A] accounting-total-border">
                <td colSpan={3} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs font-editorial-sans">
                  Total Neraca Saldo:
                </td>
                <td className="py-3.5 px-4 text-right font-editorial-mono text-sm font-bold text-[#1A1A1A]">
                  {formatRupiah(trialBalance.totalDebit)}
                </td>
                <td className="py-3.5 px-4 text-right font-editorial-mono text-sm font-bold text-[#1A1A1A]">
                  {formatRupiah(trialBalance.totalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
