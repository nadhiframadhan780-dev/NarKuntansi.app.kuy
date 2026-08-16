import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { Account, JournalEntryItem, Transaction } from '../types/accounting';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  editTransaction?: Transaction | null;
  accounts: Account[];
  defaultCategory?: 'umum' | 'penyesuaian';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editTransaction,
  accounts,
  defaultCategory = 'umum',
}) => {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [refNumber, setRefNumber] = useState<string>('JU-001');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<'umum' | 'penyesuaian'>(defaultCategory);
  const [notes, setNotes] = useState<string>('');
  const [entries, setEntries] = useState<JournalEntryItem[]>([
    { accountCode: accounts[0]?.code || '101', accountName: accounts[0]?.name || 'Kas', debit: 0, credit: 0 },
    { accountCode: accounts[1]?.code || '301', accountName: accounts[1]?.name || 'Modal', debit: 0, credit: 0 },
  ]);

  useEffect(() => {
    if (editTransaction) {
      setDate(editTransaction.date);
      setRefNumber(editTransaction.refNumber);
      setDescription(editTransaction.description);
      setCategory(editTransaction.category === 'penyesuaian' ? 'penyesuaian' : 'umum');
      setNotes(editTransaction.notes || '');
      setEntries(
        editTransaction.entries.map((e) => ({
          accountCode: e.accountCode,
          accountName: e.accountName,
          debit: e.debit || 0,
          credit: e.credit || 0,
        }))
      );
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setRefNumber(defaultCategory === 'penyesuaian' ? 'AJP-001' : 'JU-001');
      setDescription('');
      setCategory(defaultCategory);
      setNotes('');
      setEntries([
        { accountCode: accounts[0]?.code || '101', accountName: accounts[0]?.name || 'Kas', debit: 0, credit: 0 },
        { accountCode: accounts[1]?.code || '301', accountName: accounts[1]?.name || 'Modal', debit: 0, credit: 0 },
      ]);
    }
  }, [editTransaction, isOpen, defaultCategory, accounts]);

  if (!isOpen) return null;

  const totalDebit = entries.reduce((s, e) => s + (Number(e.debit) || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + (Number(e.credit) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff === 0 && totalDebit > 0;

  const handleAccountChange = (index: number, code: string) => {
    const targetAcc = accounts.find((a) => a.code === code);
    const updated = [...entries];
    updated[index].accountCode = code;
    updated[index].accountName = targetAcc ? targetAcc.name : '';
    setEntries(updated);
  };

  const handleAmountChange = (index: number, field: 'debit' | 'credit', valStr: string) => {
    const val = parseRupiahInput(valStr);
    const updated = [...entries];
    updated[index][field] = val;
    if (field === 'debit' && val > 0) updated[index].credit = 0;
    if (field === 'credit' && val > 0) updated[index].debit = 0;
    setEntries(updated);
  };

  const addEntryRow = () => {
    const firstAcc = accounts[0] || { code: '101', name: 'Kas' };
    setEntries([...entries, { accountCode: firstAcc.code, accountName: firstAcc.name, debit: 0, credit: 0 }]);
  };

  const removeEntryRow = (idx: number) => {
    if (entries.length <= 2) return;
    setEntries(entries.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;

    onSave({
      date,
      refNumber,
      description: description.trim() || 'Transaksi Jurnal',
      category,
      notes: notes.trim(),
      entries: entries.map((en) => ({
        accountCode: en.accountCode,
        accountName: en.accountName,
        debit: Math.round(Number(en.debit) || 0),
        credit: Math.round(Number(en.credit) || 0),
      })),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] w-full max-w-3xl rounded-xl shadow-2xl border border-[#E6E0D6] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1A1A1A] text-[#F9F8F6] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-editorial-serif">
              {editTransaction ? 'Edit Transaksi Jurnal' : category === 'penyesuaian' ? 'Tambah Jurnal Penyesuaian' : 'Tambah Transaksi Jurnal Umum'}
            </h3>
            <p className="text-xs text-[#D3CBC0] mt-0.5 font-editorial-sans">
              Pastikan entri transaksi memenuhi prinsip berpasangan (Debit = Kredit)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#D3CBC0] hover:text-[#FFFFFF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 font-editorial-sans">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] font-editorial-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">No. Referensi / Bukti</label>
              <input
                type="text"
                required
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="Contoh: JU-001 / BKK-102"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] font-editorial-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Kategori Jurnal</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
              >
                <option value="umum">Jurnal Umum</option>
                <option value="penyesuaian">Jurnal Penyesuaian (AJP)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Deskripsi / Keterangan Transaksi</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembelian perlengkapan toko secara tunai"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>

          {/* Journal Entries Table */}
          <div className="border border-[#E6E0D6] rounded-xl overflow-hidden shadow-xs">
            <div className="bg-[#F4F1EA] px-4 py-2.5 border-b border-[#D3CBC0] flex items-center justify-between">
              <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-editorial-sans">
                Rincian Akun & Posisi (Debit / Kredit)
              </span>
              <button
                type="button"
                onClick={addEntryRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1A1A] bg-[#FFFFFF] hover:bg-[#EFECE5] border border-[#D3CBC0] px-2.5 py-1 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris Akun
              </button>
            </div>

            <div className="p-3 space-y-2.5 bg-[#FFFFFF]">
              {entries.map((entry, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-[#FAF9F6] rounded-lg border border-[#E6E0D6]">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] text-[#8C877E] sm:hidden">Akun</label>
                    <select
                      value={entry.accountCode}
                      onChange={(e) => handleAccountChange(idx, e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs sm:text-sm border border-[#D3CBC0] rounded-md bg-[#FFFFFF] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.code}>
                          {acc.code} - {acc.name} ({acc.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="text-[10px] text-[#8C877E] sm:hidden">Debit (Rp)</label>
                    <input
                      type="text"
                      placeholder="Debit"
                      value={entry.debit > 0 ? entry.debit.toLocaleString('id-ID') : ''}
                      onChange={(e) => handleAmountChange(idx, 'debit', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs sm:text-sm text-right font-editorial-mono bg-[#FFFFFF] border border-[#D3CBC0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                    />
                  </div>

                  <div className="w-full sm:w-36">
                    <label className="text-[10px] text-[#8C877E] sm:hidden">Kredit (Rp)</label>
                    <input
                      type="text"
                      placeholder="Kredit"
                      value={entry.credit > 0 ? entry.credit.toLocaleString('id-ID') : ''}
                      onChange={(e) => handleAmountChange(idx, 'credit', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs sm:text-sm text-right font-editorial-mono bg-[#FFFFFF] border border-[#D3CBC0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEntryRow(idx)}
                    disabled={entries.length <= 2}
                    className={`p-1.5 text-[#8C877E] hover:text-[#991B1B] rounded-md transition-colors ${
                      entries.length <= 2 ? 'opacity-30 cursor-not-allowed' : ''
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Subtotal & Balance Validation Bar */}
            <div className="p-3 bg-[#F4F1EA] border-t border-[#D3CBC0] flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-0.5 rounded">
                    <Check className="w-4 h-4" /> SEIMBANG (BALANCE)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] px-2.5 py-0.5 rounded">
                    <AlertCircle className="w-4 h-4" /> TIDAK SEIMBANG — Selisih {formatRupiah(diff)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-editorial-mono">
                <div>
                  <span className="text-[#5C5852] mr-1.5 font-editorial-sans">Debit:</span>
                  <span className="font-bold text-[#1A1A1A]">{formatRupiah(totalDebit)}</span>
                </div>
                <div>
                  <span className="text-[#5C5852] mr-1.5 font-editorial-sans">Kredit:</span>
                  <span className="font-bold text-[#1A1A1A]">{formatRupiah(totalCredit)}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Faktur No. FP-901 / Bukti Kas Keluar"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E0D6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-[#5C5852] hover:bg-[#EFECE5] rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isBalanced}
              className={`px-5 py-2 text-xs sm:text-sm font-bold text-[#F9F8F6] rounded-lg shadow-xs transition-all ${
                isBalanced
                  ? 'bg-[#1A1A1A] hover:bg-[#2F2C28]'
                  : 'bg-[#D3CBC0] text-[#8C877E] cursor-not-allowed'
              }`}
            >
              {editTransaction ? 'Simpan Perubahan' : 'Tambah ke Jurnal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
