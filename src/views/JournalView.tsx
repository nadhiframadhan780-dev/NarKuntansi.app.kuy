import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, Sparkles, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Transaction } from '../types/accounting';
import { formatRupiah } from '../utils/formatters';
import { exportSingleJournalToExcel } from '../utils/excelExporter';

interface JournalViewProps {
  onOpenTransactionModal: (tx?: Transaction, defaultCategory?: 'umum' | 'penyesuaian') => void;
  onOpenParser: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  onOpenTransactionModal,
  onOpenParser,
}) => {
  const { transactions, deleteTransaction, settings, standard } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'umum' | 'penyesuaian' | 'penutup' | 'pembalik'>('all');

  const filteredTransactions = transactions
    .filter((tx) => {
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(term) ||
        tx.refNumber.toLowerCase().includes(term) ||
        tx.entries.some(
          (e) =>
            e.accountName.toLowerCase().includes(term) ||
            e.accountCode.toLowerCase().includes(term)
        )
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDebit = filteredTransactions.reduce(
    (sum, tx) => sum + tx.entries.reduce((s, e) => s + (e.debit || 0), 0),
    0
  );
  const totalCredit = filteredTransactions.reduce(
    (sum, tx) => sum + tx.entries.reduce((s, e) => s + (e.credit || 0), 0),
    0
  );
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleExportJournal = () => {
    exportSingleJournalToExcel(transactions, settings, standard);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
            Jurnal Umum (General Journal - JU)
          </h2>
          <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
            Pencatatan kronologis transaksi bisnis primer berdasarkan prinsip pembukuan berpasangan (Double-Entry)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenParser}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1A1A1A] bg-[#F4F1EA] hover:bg-[#EBE5DB] border border-[#D3CBC0] transition-colors shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#8C877E]" /> Parser Soal
          </button>

          <button
            onClick={() => onOpenTransactionModal(undefined, 'penyesuaian')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1A1A1A] bg-[#EFECE5] hover:bg-[#E5DFD5] border border-[#D3CBC0] transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-[#5C5852]" /> + Jurnal Penyesuaian (AJP)
          </button>

          <button
            onClick={() => onOpenTransactionModal(undefined, 'umum')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> + Entri Transaksi Baru
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E0D6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C877E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi, ref, atau akun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 text-xs text-[#5C5852]">
            <Filter className="w-3.5 h-3.5 text-[#8C877E]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-[#F9F8F6] border border-[#D3CBC0] text-xs rounded-lg px-2.5 py-1.5 font-medium text-[#1A1A1A] focus:outline-none"
            >
              <option value="all">Semua Kategori Jurnal</option>
              <option value="umum">Jurnal Umum Sahaja</option>
              <option value="penyesuaian">Jurnal Penyesuaian (AJP)</option>
              <option value="penutup">Jurnal Penutup (Closing)</option>
              <option value="pembalik">Jurnal Pembalik (Reversing)</option>
            </select>
          </div>

          <button
            onClick={handleExportJournal}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg transition-colors"
            title="Ekspor Jurnal ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#166534]" /> Ekspor Sheet
          </button>
        </div>
      </div>

      {/* Main Journal Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#F4F1EA] border-b border-[#D3CBC0] text-[#1A1A1A] font-bold uppercase text-[11px] tracking-wider font-editorial-sans">
                <th className="py-3 px-4 w-28">Tanggal</th>
                <th className="py-3 px-3 w-24">No. Ref</th>
                <th className="py-3 px-4">Keterangan / Nama Akun</th>
                <th className="py-3 px-3 w-20 text-center">Ref Akun</th>
                <th className="py-3 px-4 w-36 text-right">Debit (Rp)</th>
                <th className="py-3 px-4 w-36 text-right">Kredit (Rp)</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8C877E]">
                    <p className="font-semibold text-sm font-editorial-serif">Belum ada data transaksi dalam jurnal.</p>
                    <p className="text-xs mt-1">Gunakan tombol "+ Entri Transaksi Baru" atau "Parser Soal".</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <React.Fragment key={tx.id}>
                    {/* Header Row for each transaction */}
                    <tr className="bg-[#FAF9F6] hover:bg-[#F4F1EA]/60 border-t border-[#D3CBC0]">
                      <td className="py-2.5 px-4 font-editorial-mono font-semibold text-[#1A1A1A] align-top">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-3 font-editorial-mono text-xs font-medium text-[#5C5852] align-top">
                        <span className="bg-[#EFECE5] px-1.5 py-0.5 rounded border border-[#D3CBC0]">
                          {tx.refNumber}
                        </span>
                      </td>
                      <td colSpan={4} className="py-2.5 px-4 font-semibold text-[#1A1A1A]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-editorial-serif text-sm font-bold">{tx.description}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase font-editorial-sans ${
                              tx.category === 'penyesuaian'
                                ? 'bg-[#EDE8E0] text-[#1A1A1A] border border-[#D3CBC0]'
                                : tx.category === 'penutup'
                                ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                                : tx.category === 'pembalik'
                                ? 'bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]'
                                : 'bg-[#EFECE5] text-[#5C5852]'
                            }`}
                          >
                            {tx.category === 'penyesuaian'
                              ? 'Penyesuaian'
                              : tx.category === 'penutup'
                              ? 'Penutup'
                              : tx.category === 'pembalik'
                              ? 'Pembalik'
                              : 'Umum'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center align-top">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenTransactionModal(tx)}
                            className="p-1 text-[#8C877E] hover:text-[#1A1A1A] rounded transition-colors"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus transaksi "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1 text-[#8C877E] hover:text-[#991B1B] rounded transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Account Entry Rows */}
                    {tx.entries.map((entry, eIdx) => {
                      const isCredit = entry.credit > 0 && entry.debit === 0;
                      return (
                        <tr key={`${tx.id}-${eIdx}`} className="hover:bg-[#FAF9F6] font-editorial-mono text-xs">
                          <td className="py-1.5 px-4"></td>
                          <td className="py-1.5 px-3"></td>
                          <td className={`py-1.5 px-4 ${isCredit ? 'pl-8 text-[#5C5852] italic' : 'font-medium text-[#1A1A1A]'}`}>
                            {entry.accountName}
                          </td>
                          <td className="py-1.5 px-3 text-center text-[#8C877E] font-medium">
                            {entry.accountCode}
                          </td>
                          <td className="py-1.5 px-4 text-right font-medium text-[#1A1A1A]">
                            {entry.debit > 0 ? formatRupiah(entry.debit) : '-'}
                          </td>
                          <td className="py-1.5 px-4 text-right font-medium text-[#1A1A1A]">
                            {entry.credit > 0 ? formatRupiah(entry.credit) : '-'}
                          </td>
                          <td className="py-1.5 px-3"></td>
                        </tr>
                      );
                    })}

                    {tx.notes && (
                      <tr className="border-b border-[#E6E0D6]/60">
                        <td></td>
                        <td></td>
                        <td colSpan={5} className="py-1 px-4 text-[11px] text-[#8C877E] italic font-editorial-serif">
                          (Catatan: {tx.notes})
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot>
                <tr className="bg-[#F4F1EA] font-bold text-[#1A1A1A] accounting-total-border">
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-xs font-editorial-sans">
                    Total Jurnal:
                  </td>
                  <td className="py-3 px-4 text-right font-editorial-mono text-xs sm:text-sm font-bold text-[#1A1A1A]">
                    {formatRupiah(totalDebit)}
                  </td>
                  <td className="py-3 px-4 text-right font-editorial-mono text-xs sm:text-sm font-bold text-[#1A1A1A]">
                    {formatRupiah(totalCredit)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isBalanced ? (
                      <span className="text-[10px] bg-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-full font-editorial-sans font-bold">
                        Balance ✓
                      </span>
                    ) : (
                      <span className="text-[10px] bg-[#FEE2E2] text-[#991B1B] px-2 py-0.5 rounded-full font-editorial-sans font-bold">
                        Selisih!
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
