import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Transaction, Account } from '../types/accounting';
import { formatRupiah } from '../utils/formatters';
import { exportSingleJournalToExcel } from '../utils/excelExporter';

interface AdjustingJournalViewProps {
  onOpenTransactionModal: (tx?: Transaction, defaultCategory?: 'umum' | 'penyesuaian') => void;
  onOpenParser?: () => void;
}

export const AdjustingJournalView: React.FC<AdjustingJournalViewProps> = ({
  onOpenTransactionModal,
  onOpenParser,
}) => {
  const { transactions, accounts, deleteTransaction, settings, standard, addTransaction } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Only filter transactions that are strictly 'penyesuaian' (AJP)
  const adjustingTransactions = transactions
    .filter((tx) => tx.category === 'penyesuaian')
    .filter((tx) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        tx.description.toLowerCase().includes(term) ||
        tx.refNumber.toLowerCase().includes(term) ||
        (tx.notes && tx.notes.toLowerCase().includes(term)) ||
        tx.entries.some(
          (e) =>
            e.accountName.toLowerCase().includes(term) ||
            e.accountCode.toLowerCase().includes(term)
        )
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDebit = adjustingTransactions.reduce(
    (sum, tx) => sum + tx.entries.reduce((s, e) => s + (e.debit || 0), 0),
    0
  );
  const totalCredit = adjustingTransactions.reduce(
    (sum, tx) => sum + tx.entries.reduce((s, e) => s + (e.credit || 0), 0),
    0
  );
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  // Auto-generate next AJP reference number (e.g., AJP-001, AJP-002, ...)
  const nextAjpRef = () => {
    const existingNums = transactions
      .filter((t) => t.category === 'penyesuaian')
      .map((t) => {
        const match = t.refNumber.match(/AJP-(\d+)/i);
        return match ? parseInt(match[1], 10) : 0;
      });
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums, 0) : 0;
    return `AJP-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Quick Adjustment Preset Templates (Standard Accounting Best Practices in Indonesia)
  const applyPresetTemplate = (templateType: string) => {
    const ref = nextAjpRef();
    const periodEnd = settings.periodEnd || new Date().toISOString().slice(0, 10);

    if (templateType === 'depresiasi') {
      // Beban Penyusutan (D) vs Akumulasi Penyusutan (K)
      const expAcc = accounts.find((a) => a.code.startsWith('505') || a.name.toLowerCase().includes('penyusutan')) || accounts.find((a) => a.category === 'BEBAN');
      const contraAcc = accounts.find((a) => a.isContra && a.name.toLowerCase().includes('penyusutan')) || accounts.find((a) => a.code === '125' || a.code === '123' || a.code === '122');

      onOpenTransactionModal(
        {
          id: '',
          date: periodEnd,
          refNumber: ref,
          description: 'Penyesuaian Beban Penyusutan Aset Tetap Periode Berjalan',
          category: 'penyesuaian',
          notes: 'Metode garis lurus: (Harga Perolehan - Nilai Sisa) / Umur Ekonomis',
          entries: [
            {
              accountCode: expAcc?.code || '505',
              accountName: expAcc?.name || 'Beban Penyusutan Aset Tetap',
              debit: 1000000,
              credit: 0,
            },
            {
              accountCode: contraAcc?.code || '125',
              accountName: contraAcc?.name || 'Akumulasi Penyusutan Aset Tetap',
              debit: 0,
              credit: 1000000,
            },
          ],
        },
        'penyesuaian'
      );
    } else if (templateType === 'perlengkapan') {
      // Beban Perlengkapan (D) vs Perlengkapan (K)
      const expAcc = accounts.find((a) => a.code.startsWith('504') || a.name.toLowerCase().includes('beban perlengkapan')) || accounts.find((a) => a.category === 'BEBAN');
      const assetAcc = accounts.find((a) => a.code.startsWith('105') || a.code.startsWith('106') || a.name.toLowerCase().includes('perlengkapan'));

      onOpenTransactionModal(
        {
          id: '',
          date: periodEnd,
          refNumber: ref,
          description: 'Penyesuaian Perlengkapan yang Terpakai / Habis Pakai',
          category: 'penyesuaian',
          notes: 'Saldo Perlengkapan Awal - Saldo Fisik Tersisa Akhir Periode',
          entries: [
            {
              accountCode: expAcc?.code || '504',
              accountName: expAcc?.name || 'Beban Perlengkapan',
              debit: 1500000,
              credit: 0,
            },
            {
              accountCode: assetAcc?.code || '106',
              accountName: assetAcc?.name || 'Perlengkapan Kantor',
              debit: 0,
              credit: 1500000,
            },
          ],
        },
        'penyesuaian'
      );
    } else if (templateType === 'dibayar_dimuka') {
      // Beban Sewa/Asuransi (D) vs Sewa/Asuransi Dibayar Dimuka (K)
      const expAcc = accounts.find((a) => a.code.startsWith('503') || a.name.toLowerCase().includes('beban sewa')) || accounts.find((a) => a.category === 'BEBAN');
      const prepaidAcc = accounts.find((a) => a.code.startsWith('107') || a.name.toLowerCase().includes('dibayar dimuka'));

      onOpenTransactionModal(
        {
          id: '',
          date: periodEnd,
          refNumber: ref,
          description: 'Penyesuaian Beban Sewa / Asuransi yang Telah Jatuh Tempo (Kadaluarsa)',
          category: 'penyesuaian',
          notes: 'Alokasi manfaat yang telah terpakai selama periode berjalan',
          entries: [
            {
              accountCode: expAcc?.code || '503',
              accountName: expAcc?.name || 'Beban Sewa',
              debit: 2000000,
              credit: 0,
            },
            {
              accountCode: prepaidAcc?.code || '107',
              accountName: prepaidAcc?.name || 'Sewa Dibayar Dimuka',
              debit: 0,
              credit: 2000000,
            },
          ],
        },
        'penyesuaian'
      );
    } else if (templateType === 'beban_akrual') {
      // Beban Gaji/Listrik (D) vs Utang Beban/Gaji (K)
      const expAcc = accounts.find((a) => a.code.startsWith('502') || a.name.toLowerCase().includes('gaji')) || accounts.find((a) => a.category === 'BEBAN');
      const liabAcc = accounts.find((a) => a.code.startsWith('202') || a.code.startsWith('203') || a.name.toLowerCase().includes('utang gaji') || a.name.toLowerCase().includes('akrual'));

      onOpenTransactionModal(
        {
          id: '',
          date: periodEnd,
          refNumber: ref,
          description: 'Pengakuan Beban yang Masih Harus Dibayar (Accrued Expense)',
          category: 'penyesuaian',
          notes: 'Beban telah terjadi namun belum dibayarkan hingga akhir periode',
          entries: [
            {
              accountCode: expAcc?.code || '502',
              accountName: expAcc?.name || 'Beban Gaji dan Tunjangan',
              debit: 3500000,
              credit: 0,
            },
            {
              accountCode: liabAcc?.code || '203',
              accountName: liabAcc?.name || 'Utang Gaji Karyawan',
              debit: 0,
              credit: 3500000,
            },
          ],
        },
        'penyesuaian'
      );
    } else if (templateType === 'piutang_pendapatan') {
      // Piutang Pendapatan (D) vs Pendapatan Jasa/Bunga (K)
      const assetAcc = accounts.find((a) => a.code.startsWith('103') || a.name.toLowerCase().includes('piutang'));
      const revAcc = accounts.find((a) => a.code.startsWith('401') || a.name.toLowerCase().includes('pendapatan'));

      onOpenTransactionModal(
        {
          id: '',
          date: periodEnd,
          refNumber: ref,
          description: 'Pengakuan Piutang Pendapatan yang Masih Harus Diterima (Accrued Revenue)',
          category: 'penyesuaian',
          notes: 'Jasa/pekerjaan telah selesai tetapi belum menerima pembayaran atau belum ditagihkan',
          entries: [
            {
              accountCode: assetAcc?.code || '103',
              accountName: assetAcc?.name || 'Piutang Usaha',
              debit: 5000000,
              credit: 0,
            },
            {
              accountCode: revAcc?.code || '401',
              accountName: revAcc?.name || 'Pendapatan Penjualan / Jasa',
              debit: 0,
              credit: 5000000,
            },
          ],
        },
        'penyesuaian'
      );
    }
    setSelectedTemplate('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
              Jurnal Penyesuaian (Adjusting Journal Entries - AJP)
            </h2>
            <span className="text-xs bg-[#1A1A1A] text-[#F9F8F6] font-bold px-2.5 py-0.5 rounded-full font-editorial-mono">
              {adjustingTransactions.length} Ayat Jurnal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5852] font-editorial-sans max-w-3xl">
            Pencatatan akhir periode akuntansi ({settings.periodStart} s/d {settings.periodEnd}) untuk memperbarui saldo akun riil & nominal agar mencerminkan kondisi aktual sesuai prinsip akrual.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenParser && (
            <button
              onClick={onOpenParser}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#1A1A1A] bg-[#F4F1EA] hover:bg-[#EBE5DB] border border-[#D3CBC0] transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#8C877E]" /> Parser Soal AJP
            </button>
          )}

          <button
            onClick={() => onOpenTransactionModal(undefined, 'penyesuaian')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> + Entri AJP Baru
          </button>
        </div>
      </div>

      {/* Quick Templates Bar */}
      <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E6E0D6] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#1A1A1A]" />
          <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-editorial-sans">
            Template Cepat Jenis Penyesuaian Akuntansi:
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => applyPresetTemplate('depresiasi')}
            className="px-2.5 py-1.5 text-xs bg-[#FFFFFF] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg text-[#1A1A1A] font-medium transition-colors"
          >
            🏢 Penyusutan Aset Tetap
          </button>
          <button
            onClick={() => applyPresetTemplate('perlengkapan')}
            className="px-2.5 py-1.5 text-xs bg-[#FFFFFF] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg text-[#1A1A1A] font-medium transition-colors"
          >
            📦 Pemakaian Perlengkapan
          </button>
          <button
            onClick={() => applyPresetTemplate('dibayar_dimuka')}
            className="px-2.5 py-1.5 text-xs bg-[#FFFFFF] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg text-[#1A1A1A] font-medium transition-colors"
          >
            ⏳ Sewa/Asuransi Dibayar Dimuka
          </button>
          <button
            onClick={() => applyPresetTemplate('beban_akrual')}
            className="px-2.5 py-1.5 text-xs bg-[#FFFFFF] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg text-[#1A1A1A] font-medium transition-colors"
          >
            💼 Beban Akrual / Utang Gaji
          </button>
          <button
            onClick={() => applyPresetTemplate('piutang_pendapatan')}
            className="px-2.5 py-1.5 text-xs bg-[#FFFFFF] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg text-[#1A1A1A] font-medium transition-colors"
          >
            💰 Piutang Pendapatan
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E0D6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C877E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi penyesuaian, ref (AJP-...), atau akun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5C5852]">Total Entri Penyesuaian:</span>
            <span className="text-xs font-bold font-editorial-mono bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#D3CBC0]">
              {adjustingTransactions.length} Transaksi
            </span>
          </div>

          <button
            onClick={() => exportSingleJournalToExcel(transactions, settings, standard)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg transition-colors"
            title="Ekspor Seluruh Jurnal ke Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#166534]" /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* Main AJP Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#F4F1EA] border-b border-[#D3CBC0] text-[#1A1A1A] font-bold uppercase text-[11px] tracking-wider font-editorial-sans">
                <th className="py-3 px-4 w-28">Tanggal</th>
                <th className="py-3 px-3 w-28">No. Ref AJP</th>
                <th className="py-3 px-4">Keterangan / Nama Akun Penyesuaian</th>
                <th className="py-3 px-3 w-24 text-center">Kode Akun</th>
                <th className="py-3 px-4 w-36 text-right">Debit (Rp)</th>
                <th className="py-3 px-4 w-36 text-right">Kredit (Rp)</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D6]">
              {adjustingTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8C877E] px-4">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#F4F1EA] border border-[#D3CBC0] flex items-center justify-center mx-auto text-[#1A1A1A]">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-base font-editorial-serif text-[#1A1A1A]">
                        Belum Ada Ayat Jurnal Penyesuaian (AJP)
                      </h4>
                      <p className="text-xs text-[#5C5852] leading-relaxed">
                        Jurnal penyesuaian dibuat pada akhir periode akuntansi untuk mencatat beban penyusutan, perlengkapan terpakai, beban akrual, atau pendapatan yang masih harus diterima.
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => applyPresetTemplate('depresiasi')}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#1A1A1A] text-[#F9F8F6] rounded-lg hover:bg-[#33302C] transition-colors"
                        >
                          + Tambah Penyesuaian Otomatis
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                adjustingTransactions.map((tx) => (
                  <React.Fragment key={tx.id}>
                    {/* Header Row for each transaction */}
                    <tr className="bg-[#FAF9F6] hover:bg-[#F4F1EA]/60 border-t border-[#D3CBC0]">
                      <td className="py-2.5 px-4 font-editorial-mono font-semibold text-[#1A1A1A] align-top">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-3 font-editorial-mono text-xs font-bold text-[#1A1A1A] align-top">
                        <span className="bg-[#EFECE5] px-2 py-0.5 rounded border border-[#D3CBC0] text-[#1A1A1A]">
                          {tx.refNumber}
                        </span>
                      </td>
                      <td colSpan={4} className="py-2.5 px-4 font-semibold text-[#1A1A1A]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-editorial-serif text-sm font-bold text-[#1A1A1A]">{tx.description}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase font-editorial-sans bg-[#EDE8E0] text-[#1A1A1A] border border-[#D3CBC0]">
                            Ayat Penyesuaian
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center align-top">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenTransactionModal(tx, 'penyesuaian')}
                            className="p-1.5 text-[#8C877E] hover:text-[#1A1A1A] rounded transition-colors"
                            title="Edit Jurnal Penyesuaian"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus jurnal penyesuaian "${tx.description}"?`)) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="p-1.5 text-[#8C877E] hover:text-[#991B1B] rounded transition-colors"
                            title="Hapus Jurnal Penyesuaian"
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
                          <td className="py-2 px-4"></td>
                          <td className="py-2 px-3"></td>
                          <td className={`py-2 px-4 ${isCredit ? 'pl-8 sm:pl-10 text-[#5C5852] italic' : 'font-semibold text-[#1A1A1A]'}`}>
                            {entry.accountName}
                          </td>
                          <td className="py-2 px-3 text-center text-[#5C5852] font-semibold">
                            <span className="bg-[#F4F1EA] px-1.5 py-0.5 rounded">
                              {entry.accountCode}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-right font-medium text-[#1A1A1A]">
                            {entry.debit > 0 ? formatRupiah(entry.debit) : '-'}
                          </td>
                          <td className="py-2 px-4 text-right font-medium text-[#1A1A1A]">
                            {entry.credit > 0 ? formatRupiah(entry.credit) : '-'}
                          </td>
                          <td className="py-2 px-3"></td>
                        </tr>
                      );
                    })}

                    {tx.notes && (
                      <tr className="border-b border-[#E6E0D6]/60 bg-[#FFFFFF]">
                        <td></td>
                        <td></td>
                        <td colSpan={5} className="py-1 px-4 text-[11px] text-[#8C877E] italic font-editorial-serif">
                          (Dasar Perhitungan / Bukti Memo: {tx.notes})
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
            {adjustingTransactions.length > 0 && (
              <tfoot>
                <tr className="bg-[#F4F1EA] font-bold text-[#1A1A1A] accounting-total-border">
                  <td colSpan={4} className="py-3.5 px-4 text-right uppercase tracking-wider text-xs font-editorial-sans">
                    Total Jurnal Penyesuaian (AJP):
                  </td>
                  <td className="py-3.5 px-4 text-right font-editorial-mono text-xs sm:text-sm font-bold text-[#1A1A1A]">
                    {formatRupiah(totalDebit)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-editorial-mono text-xs sm:text-sm font-bold text-[#1A1A1A]">
                    {formatRupiah(totalCredit)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
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
