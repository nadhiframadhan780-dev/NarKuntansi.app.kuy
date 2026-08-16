import React, { useState } from 'react';
import { Search, Filter, Plus, RotateCcw, Trash2, Edit2, X } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Account, AccountCategory, NormalBalance } from '../types/accounting';
import { STANDARD_DESCRIPTIONS } from '../data/coaStandards';

export const CoaView: React.FC = () => {
  const { accounts, addAccount, updateAccount, deleteAccount, resetCoaToDefault, standard } = useAccounting();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AccountCategory>(AccountCategory.ASET);
  const [formNormal, setFormNormal] = useState<NormalBalance>(NormalBalance.DEBIT);
  const [formContra, setFormContra] = useState(false);
  const [formDesc, setFormDesc] = useState('');

  const stdInfo = STANDARD_DESCRIPTIONS[standard];

  const filteredAccounts = accounts.filter((acc) => {
    if (categoryFilter !== 'all' && acc.category !== categoryFilter) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      acc.name.toLowerCase().includes(term) ||
      acc.code.toLowerCase().includes(term) ||
      acc.category.toLowerCase().includes(term)
    );
  });

  const handleOpenAdd = () => {
    setEditingAcc(null);
    setFormCode('');
    setFormName('');
    setFormCategory(AccountCategory.ASET);
    setFormNormal(NormalBalance.DEBIT);
    setFormContra(false);
    setFormDesc('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAcc(acc);
    setFormCode(acc.code);
    setFormName(acc.name);
    setFormCategory(acc.category);
    setFormNormal(acc.normalBalance);
    setFormContra(!!acc.isContra);
    setFormDesc(acc.description || '');
    setIsAddModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) return;

    if (editingAcc) {
      updateAccount(editingAcc.id, {
        code: formCode.trim(),
        name: formName.trim(),
        category: formCategory,
        normalBalance: formNormal,
        isContra: formContra,
        description: formDesc.trim(),
      });
    } else {
      addAccount({
        code: formCode.trim(),
        name: formName.trim(),
        category: formCategory,
        normalBalance: formNormal,
        isContra: formContra,
        description: formDesc.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 sm:p-6 rounded-xl border border-[#E6E0D6] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] font-editorial-serif tracking-tight">
              Bagan Akun Standar (Chart of Accounts)
            </h2>
            <span className="text-xs bg-[#F4F1EA] text-[#1A1A1A] border border-[#D3CBC0] font-bold px-2 py-0.5 rounded font-editorial-sans">
              {standard}
            </span>
          </div>
          <p className="text-xs text-[#5C5852] mt-1 font-editorial-sans">
            {stdInfo.tagline} (Total {accounts.length} Akun Terdaftar)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('Reset daftar akun ke standar baku COA bawaan sistem?')) {
                resetCoaToDefault();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#5C5852] bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg transition-colors font-editorial-sans"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset COA
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] rounded-lg transition-all shadow-xs font-editorial-sans"
          >
            <Plus className="w-4 h-4" /> Tambah Akun Baru
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-xl border border-[#E6E0D6]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C877E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode atau nama akun..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] font-editorial-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#8C877E]" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F9F8F6] border border-[#D3CBC0] text-xs rounded-lg px-2.5 py-1.5 text-[#1A1A1A] font-editorial-sans focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          >
            <option value="all">Semua Kategori Akun</option>
            {Object.values(AccountCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* COA Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E6E0D6] shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#F4F1EA] border-b border-[#D3CBC0] text-[#1A1A1A] font-bold uppercase text-[11px] tracking-wider font-editorial-sans">
              <th className="py-3 px-4 w-28">Kode Akun</th>
              <th className="py-3 px-4">Nama Akun</th>
              <th className="py-3 px-4 w-44">Kategori Akun</th>
              <th className="py-3 px-4 w-32 text-center">Saldo Normal</th>
              <th className="py-3 px-4 w-28 text-center">Sifat Akun</th>
              <th className="py-3 px-4">Keterangan Standar</th>
              <th className="py-3 px-3 w-20 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E0D6] font-editorial-mono text-xs">
            {filteredAccounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-[#FAF9F6]">
                <td className="py-2.5 px-4 font-semibold text-[#1A1A1A]">{acc.code}</td>
                <td className="py-2.5 px-4 font-editorial-sans font-medium text-[#1A1A1A]">
                  {acc.name}
                  {acc.isCustom && (
                    <span className="ml-2 text-[10px] bg-[#F4F1EA] text-[#1A1A1A] border border-[#D3CBC0] px-1.5 py-0.2 rounded font-editorial-sans">
                      Kustom
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-4 font-editorial-sans text-[#5C5852]">{acc.category}</td>
                <td className="py-2.5 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                      acc.normalBalance === NormalBalance.DEBIT
                        ? 'bg-[#EFECE5] text-[#1A1A1A]'
                        : 'bg-[#F4F1EA] text-[#5C5852]'
                    }`}
                  >
                    {acc.normalBalance}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center font-editorial-sans">
                  {acc.isContra ? (
                    <span className="text-[10px] bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] px-1.5 py-0.5 rounded font-semibold">
                      Kontra
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#8C877E]">Standar</span>
                  )}
                </td>
                <td className="py-2.5 px-4 font-editorial-sans text-[#5C5852] text-[11px] truncate max-w-xs">
                  {acc.description || '-'}
                </td>
                <td className="py-2.5 px-3 text-center font-editorial-sans">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1 text-[#8C877E] hover:text-[#1A1A1A] rounded transition-colors"
                      title="Edit Akun"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {acc.isCustom && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus akun ${acc.code} - ${acc.name}?`)) {
                            deleteAccount(acc.id);
                          }
                        }}
                        className="p-1 text-[#8C877E] hover:text-[#991B1B] rounded transition-colors"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-xl shadow-2xl border border-[#E6E0D6] overflow-hidden">
            <div className="px-6 py-4 bg-[#1A1A1A] text-[#F9F8F6] flex justify-between items-center">
              <h3 className="font-bold text-base font-editorial-serif">
                {editingAcc ? 'Edit Akun COA' : 'Tambah Akun Baru ke COA'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#D3CBC0] hover:text-[#FFFFFF] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 space-y-4 text-xs sm:text-sm font-editorial-sans">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Kode Akun</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Contoh: 108 atau 5.1.2.01"
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] font-editorial-mono text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Nama Akun</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Beban Pemasaran Digital"
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Kategori Akun</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                  >
                    {Object.values(AccountCategory).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1">Saldo Normal</label>
                  <select
                    value={formNormal}
                    onChange={(e) => setFormNormal(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                  >
                    <option value={NormalBalance.DEBIT}>Debit</option>
                    <option value={NormalBalance.KREDIT}>Kredit</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="contra"
                  checked={formContra}
                  onChange={(e) => setFormContra(e.target.checked)}
                  className="rounded text-[#1A1A1A] focus:ring-[#1A1A1A]"
                />
                <label htmlFor="contra" className="text-xs font-medium text-[#5C5852] cursor-pointer">
                  Akun Kontra (Mengurangi saldo kelompok utamanya, misal Akumulasi Penyusutan / Prive)
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Keterangan / Catatan</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Keterangan opsional..."
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E6E0D6]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-[#5C5852] hover:bg-[#EFECE5] rounded-lg font-semibold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#2F2C28] text-[#F9F8F6] rounded-lg font-bold shadow-xs transition-all"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
