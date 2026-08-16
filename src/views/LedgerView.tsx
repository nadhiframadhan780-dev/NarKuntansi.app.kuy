import React, { useState } from 'react';
import { Search, Filter, BookOpen, FileSpreadsheet, ChevronRight, Layers } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { AccountCategory, NormalBalance } from '../types/accounting';
import { formatRupiah } from '../utils/formatters';
import { exportSingleSheetToExcel, buildLedgerSheet } from '../utils/excelExporter';

export const LedgerView: React.FC = () => {
  const { accounts, transactions, ledgers, settings, standard } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [activeAccountCode, setActiveAccountCode] = useState<string>(accounts[0]?.code || '101');

  const activeAccountsWithLedger = accounts.filter((acc) => {
    const l = ledgers.get(acc.code);
    if (!l) return false;

    // Filter category
    if (selectedCategory !== 'all' && acc.category !== selectedCategory) return false;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesAcc =
        acc.name.toLowerCase().includes(term) || acc.code.toLowerCase().includes(term);
      const matchesEntries = l.entries.some(
        (e) =>
          e.description.toLowerCase().includes(term) ||
          e.refNumber.toLowerCase().includes(term)
      );
      if (!matchesAcc && !matchesEntries) return false;
    }

    return l.entries.length > 0 || l.endingBalance !== 0;
  });

  const handleExportLedger = () => {
    const ws = buildLedgerSheet(accounts, transactions, settings, standard);
    exportSingleSheetToExcel('Buku Besar', ws, `Buku_Besar_${settings.entityName}.xlsx`);
  };

  const selectedLedger = ledgers.get(activeAccountCode);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
            Buku Besar (General Ledger)
          </h2>
          <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
            Pengelompokan mutasi transaksi per akun untuk menghitung saldo akhir sesuai saldo normal (Debit/Kredit)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-[#F9F8F6] p-1 rounded-lg border border-[#D3CBC0] text-xs font-semibold">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'all' ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-2xs' : 'text-[#5C5852] hover:text-[#1A1A1A]'
              }`}
            >
              Semua Akun ({activeAccountsWithLedger.length})
            </button>
            <button
              onClick={() => setViewMode('single')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'single' ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-2xs' : 'text-[#5C5852] hover:text-[#1A1A1A]'
              }`}
            >
              Pilih Satu Akun
            </button>
          </div>

          <button
            onClick={handleExportLedger}
            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#166534]" /> Ekspor Sheet
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E0D6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C877E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari akun atau deskripsi mutasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Filter className="w-3.5 h-3.5 text-[#8C877E]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F9F8F6] border border-[#D3CBC0] text-xs rounded-lg px-2.5 py-1.5 font-medium text-[#1A1A1A] focus:outline-none"
          >
            <option value="all">Semua Kelompok Akun</option>
            {Object.values(AccountCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {viewMode === 'single' && (
            <select
              value={activeAccountCode}
              onChange={(e) => setActiveAccountCode(e.target.value)}
              className="bg-[#F9F8F6] border border-[#D3CBC0] text-xs rounded-lg px-2.5 py-1.5 font-semibold text-[#1A1A1A] focus:outline-none"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.code}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Ledger Accounts Display */}
      {viewMode === 'single' ? (
        selectedLedger ? (
          <LedgerAccountCard ledger={selectedLedger} />
        ) : (
          <div className="p-8 text-center text-[#8C877E] bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] font-editorial-serif">
            Akun tidak memiliki riwayat mutasi transaksi.
          </div>
        )
      ) : (
        <div className="space-y-6">
          {activeAccountsWithLedger.length === 0 ? (
            <div className="p-12 text-center text-[#8C877E] bg-[#FFFFFF] rounded-xl border border-[#E6E0D6]">
              <BookOpen className="w-8 h-8 mx-auto text-[#D3CBC0] mb-2" />
              <p className="font-semibold text-sm font-editorial-serif text-[#1A1A1A]">Belum ada akun yang memiliki mutasi transaksi.</p>
              <p className="text-xs mt-1">Tambahkan entri transaksi di Jurnal Umum terlebih dahulu.</p>
            </div>
          ) : (
            activeAccountsWithLedger.map((acc) => {
              const l = ledgers.get(acc.code)!;
              return <LedgerAccountCard key={acc.id} ledger={l} />;
            })
          )}
        </div>
      )}
    </div>
  );
};

interface LedgerAccountCardProps {
  ledger: {
    account: any;
    entries: any[];
    totalDebit: number;
    totalCredit: number;
    endingBalance: number;
    endingBalanceDebit: number;
    endingBalanceCredit: number;
  };
}

const LedgerAccountCard: React.FC<LedgerAccountCardProps> = ({ ledger }) => {
  const { account, entries, totalDebit, totalCredit, endingBalance } = ledger;
  const isNormalDebit = account.normalBalance === NormalBalance.DEBIT;

  let currentRunning = 0;

  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
      {/* Account Header */}
      <div className="bg-[#1A1A1A] text-[#F9F8F6] px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="font-editorial-mono font-bold text-xs sm:text-sm bg-[#33302C] text-[#E6E0D6] px-2.5 py-1 rounded border border-[#4D4943]">
            {account.code}
          </span>
          <div>
            <h3 className="font-editorial-serif font-bold text-base sm:text-lg text-[#F9F8F6]">{account.name}</h3>
            <span className="text-[11px] text-[#D3CBC0] font-editorial-sans">
              Kategori: {account.category} | Saldo Normal: {account.normalBalance}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-editorial-mono bg-[#2A2723] px-3.5 py-1.5 rounded-lg border border-[#3E3A34]">
          <div>
            <span className="text-[#D3CBC0] text-[10px] block font-editorial-sans uppercase tracking-wider">Saldo Akhir</span>
            <span className="font-bold text-[#86EFAC] text-sm font-editorial-mono">
              {formatRupiah(Math.abs(endingBalance))} {endingBalance < 0 ? '(Defisit)' : `(${account.normalBalance})`}
            </span>
          </div>
        </div>
      </div>

      {/* Entries Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#F4F1EA] border-b border-[#D3CBC0] text-[#1A1A1A] font-bold uppercase text-[11px] tracking-wider font-editorial-sans">
              <th className="py-2.5 px-4 w-28">Tanggal</th>
              <th className="py-2.5 px-3 w-24">No. Ref</th>
              <th className="py-2.5 px-4">Keterangan Mutasi</th>
              <th className="py-2.5 px-4 w-36 text-right">Debit (Rp)</th>
              <th className="py-2.5 px-4 w-36 text-right">Kredit (Rp)</th>
              <th className="py-2.5 px-4 w-40 text-right">Saldo Berjalan (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 px-4 text-center text-[#8C877E] font-editorial-serif">
                  Tidak ada entri transaksi mutasi untuk akun ini.
                </td>
              </tr>
            ) : (
              entries.map((entry, idx) => {
                if (isNormalDebit) {
                  currentRunning += entry.debit - entry.credit;
                } else {
                  currentRunning += entry.credit - entry.debit;
                }

                return (
                  <tr key={idx} className="hover:bg-[#FAF9F6]">
                    <td className="py-2 px-4 text-[#1A1A1A]">{entry.date}</td>
                    <td className="py-2 px-3 text-[#5C5852] font-semibold">{entry.refNumber}</td>
                    <td className="py-2 px-4 font-editorial-sans text-[#1A1A1A]">{entry.description}</td>
                    <td className="py-2 px-4 text-right font-medium text-[#1A1A1A]">
                      {entry.debit > 0 ? formatRupiah(entry.debit) : '-'}
                    </td>
                    <td className="py-2 px-4 text-right font-medium text-[#1A1A1A]">
                      {entry.credit > 0 ? formatRupiah(entry.credit) : '-'}
                    </td>
                    <td className="py-2 px-4 text-right font-semibold text-[#1A1A1A] bg-[#FAF9F6]">
                      {formatRupiah(currentRunning)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-[#F4F1EA] font-bold text-[#1A1A1A] accounting-total-border">
              <td colSpan={3} className="py-2.5 px-4 text-right uppercase tracking-wider text-xs font-editorial-sans">
                Total Mutasi & Saldo Akhir:
              </td>
              <td className="py-2.5 px-4 text-right font-editorial-mono text-xs sm:text-sm text-[#1A1A1A]">
                {formatRupiah(totalDebit)}
              </td>
              <td className="py-2.5 px-4 text-right font-editorial-mono text-xs sm:text-sm text-[#1A1A1A]">
                {formatRupiah(totalCredit)}
              </td>
              <td className="py-2.5 px-4 text-right font-editorial-mono text-xs sm:text-sm text-[#166534] bg-[#EFECE5]">
                {formatRupiah(endingBalance)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
