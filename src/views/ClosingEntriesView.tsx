import React, { useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Lock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { formatRupiah } from '../utils/formatters';
import { generateClosingEntries, generateReversingEntries, calculateLedgers } from '../utils/accountingEngine';
import { exportSingleSheetToExcel, buildClosingEntriesSheet } from '../utils/excelExporter';

export const ClosingEntriesView: React.FC = () => {
  const { accounts, transactions, addMultipleTransactions, settings, standard } = useAccounting();
  const [activeSubTab, setActiveSubTab] = useState<'closing' | 'postTrial' | 'reversing'>('closing');
  const [isApplied, setIsApplied] = useState<boolean>(() =>
    transactions.some((t) => t.category === 'penutup')
  );

  const closingEntries = generateClosingEntries(
    accounts,
    transactions,
    settings.periodEnd,
    standard
  );

  const reversingEntries = generateReversingEntries(
    transactions,
    `${parseInt(settings.periodEnd.slice(0, 4)) + 1}-01-01`
  );

  // Compute Post-Closing Trial Balance: All transactions including closing entries
  const postClosingLedgers = calculateLedgers(accounts, transactions, [
    'umum',
    'penyesuaian',
    'penutup',
  ]);

  const postClosingItems = accounts
    .map((acc) => {
      const l = postClosingLedgers.get(acc.code);
      return {
        account: acc,
        debit: l ? l.endingBalanceDebit : 0,
        credit: l ? l.endingBalanceCredit : 0,
      };
    })
    .filter((i) => i.debit > 0 || i.credit > 0);

  const postTotalDebit = postClosingItems.reduce((s, i) => s + i.debit, 0);
  const postTotalCredit = postClosingItems.reduce((s, i) => s + i.credit, 0);

  const handlePostClosingToJournal = () => {
    if (closingEntries.length === 0) return;
    const confirmPost = window.confirm(
      'Posting 4 langkah Jurnal Penutup ini ke buku jurnal utama?\n\nAkun pendapatan dan beban akan dinolkan pada akhir periode.'
    );
    if (confirmPost) {
      addMultipleTransactions(
        closingEntries.map((c) => ({
          date: c.date,
          refNumber: c.refNumber,
          description: c.description,
          category: 'penutup',
          entries: c.entries,
          notes: c.notes,
        }))
      );
      setIsApplied(true);
      setActiveSubTab('postTrial');
    }
  };

  const handleExportClosing = () => {
    const ws = buildClosingEntriesSheet(accounts, transactions, settings, standard);
    exportSingleSheetToExcel('Jurnal Penutup', ws, `Jurnal_Penutup_${settings.entityName}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
            Jurnal Penutup & Pembalik (Closing & Reversing)
          </h2>
          <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
            Tahap penutupan akun nominal (pendapatan, beban, prive) dan persiapan neraca saldo awal periode baru
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportClosing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#166534]" /> Ekspor Sheet
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E0D6] text-xs font-semibold pb-1">
        <button
          onClick={() => setActiveSubTab('closing')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'closing'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> Jurnal Penutup ({closingEntries.length} Langkah)
        </button>

        <button
          onClick={() => setActiveSubTab('postTrial')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'postTrial'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Neraca Saldo Setelah Penutupan
        </button>

        <button
          onClick={() => setActiveSubTab('reversing')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
            activeSubTab === 'reversing'
              ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
              : 'text-[#5C5852] hover:bg-[#EFECE5]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Jurnal Pembalik (Awal Periode)
        </button>
      </div>

      {/* 1. JURNAL PENUTUP */}
      {activeSubTab === 'closing' && (
        <div className="space-y-6">
          {/* Action Callout */}
          <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E6E0D6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="font-bold text-sm text-[#1A1A1A] font-editorial-serif flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C877E]" />
                4 Langkah Standar Penutupan Buku Akuntansi
              </div>
              <p className="text-xs text-[#5C5852] mt-0.5 font-editorial-sans">
                1. Tutup Akun Pendapatan → 2. Tutup Akun Beban → 3. Tutup Ikhtisar Laba Rugi ke Modal → 4. Tutup Prive / Dividen ke Modal
              </p>
            </div>

            {!isApplied ? (
              <button
                onClick={handlePostClosingToJournal}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] rounded-lg shadow-xs transition-all flex-shrink-0"
              >
                Posting ke Jurnal Umum <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] flex-shrink-0 font-editorial-sans">
                <CheckCircle2 className="w-4 h-4 text-[#166534]" /> Jurnal Penutup Telah Diposting
              </span>
            )}
          </div>

          {/* Closing Entries Cards */}
          <div className="space-y-4">
            {closingEntries.map((tx) => (
              <div key={tx.id} className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
                <div className="bg-[#F4F1EA] px-5 py-3 border-b border-[#D3CBC0] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1A1A1A] text-[#F9F8F6] font-editorial-mono text-xs font-bold px-2 py-0.5 rounded">
                      {tx.refNumber}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-[#1A1A1A] font-editorial-serif">{tx.description}</span>
                  </div>
                  <span className="text-xs text-[#8C877E] font-editorial-mono">{tx.date}</span>
                </div>

                <div className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs p-3">
                  {tx.entries.map((entry, eIdx) => {
                    const isCredit = entry.credit > 0 && entry.debit === 0;
                    return (
                      <div
                        key={eIdx}
                        className={`flex items-center justify-between py-1.5 px-3 rounded ${
                          isCredit ? 'pl-8 text-[#5C5852] italic bg-[#FAF9F6]' : 'font-medium text-[#1A1A1A]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#8C877E] font-normal">({entry.accountCode})</span>
                          <span className="font-editorial-sans">{entry.accountName}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="w-32 text-right">
                            {entry.debit > 0 ? formatRupiah(entry.debit) : '-'}
                          </span>
                          <span className="w-32 text-right">
                            {entry.credit > 0 ? formatRupiah(entry.credit) : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NERACA SALDO SETELAH PENUTUPAN */}
      {activeSubTab === 'postTrial' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#FAF9F6] border border-[#D3CBC0] rounded-xl text-xs text-[#1A1A1A] font-editorial-sans">
            ✓ Seluruh akun nominal (Pendapatan & Beban) telah bersaldo NOL. Hanya tersisa akun riil (Aset, Liabilitas, Ekuitas) untuk periode berikutnya.
          </div>

          <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F4F1EA] border-b border-[#D3CBC0] text-[#1A1A1A] font-bold uppercase text-[11px] tracking-wider font-editorial-sans">
                  <th className="py-3 px-4 w-28">Kode Akun</th>
                  <th className="py-3 px-4">Nama Akun Riil</th>
                  <th className="py-3 px-4 w-44">Kategori Akun</th>
                  <th className="py-3 px-4 w-44 text-right">Debit (Rp)</th>
                  <th className="py-3 px-4 w-44 text-right">Kredit (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs sm:text-sm">
                {postClosingItems.map((item) => (
                  <tr key={item.account.id} className="hover:bg-[#FAF9F6]">
                    <td className="py-2.5 px-4 font-semibold text-[#1A1A1A]">{item.account.code}</td>
                    <td className="py-2.5 px-4 font-editorial-sans font-medium text-[#1A1A1A]">
                      {item.account.name}
                    </td>
                    <td className="py-2.5 px-4 font-editorial-sans text-xs text-[#5C5852]">
                      <span className="bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E6E0D6]">
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
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#F4F1EA] font-bold text-[#1A1A1A] accounting-total-border">
                  <td colSpan={3} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs font-editorial-sans">
                    Total Neraca Saldo Setelah Penutupan:
                  </td>
                  <td className="py-3.5 px-4 text-right font-editorial-mono text-sm font-bold text-[#1A1A1A]">
                    {formatRupiah(postTotalDebit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-editorial-mono text-sm font-bold text-[#1A1A1A]">
                    {formatRupiah(postTotalCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 3. JURNAL PEMBALIK */}
      {activeSubTab === 'reversing' && (
        <div className="space-y-4">
          <div className="p-3.5 bg-[#FAF9F6] border border-[#D3CBC0] rounded-xl text-xs text-[#1A1A1A] font-editorial-sans">
            Jurnal pembalik dibuat pada hari pertama periode baru untuk membalik penyesuaian pos-pos akrual (beban masih harus dibayar & pendapatan masih harus diterima).
          </div>

          {reversingEntries.length === 0 ? (
            <div className="p-8 text-center text-[#8C877E] bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] font-editorial-serif">
              Tidak ada jurnal penyesuaian pos akrual yang memerlukan jurnal pembalik pada periode ini.
            </div>
          ) : (
            reversingEntries.map((tx) => (
              <div key={tx.id} className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs p-4 space-y-2 font-editorial-mono text-xs">
                <div className="flex justify-between items-center text-xs font-bold border-b border-[#E6E0D6] pb-2 font-editorial-sans">
                  <span className="text-[#1A1A1A] font-editorial-serif">{tx.refNumber} - {tx.description}</span>
                  <span className="text-[#8C877E] font-editorial-mono">{tx.date}</span>
                </div>
                <div className="divide-y divide-[#E6E0D6]">
                  {tx.entries.map((e, idx) => (
                    <div key={idx} className="flex justify-between py-1.5">
                      <span className="font-editorial-sans text-[#1A1A1A]">{e.accountName}</span>
                      <div className="flex gap-6">
                        <span className="w-28 text-right">{e.debit > 0 ? formatRupiah(e.debit) : '-'}</span>
                        <span className="w-28 text-right">{e.credit > 0 ? formatRupiah(e.credit) : '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
