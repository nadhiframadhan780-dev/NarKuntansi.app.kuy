import React, { useState } from 'react';
import { X, Download, Upload, RotateCcw, Building } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    exportJsonBackup,
    importJsonBackup,
    loadSampleData,
    clearAllData,
    standard,
  } = useAccounting();

  const [entityName, setEntityName] = useState(settings.entityName);
  const [address, setAddress] = useState(settings.address || '');
  const [periodStart, setPeriodStart] = useState(settings.periodStart);
  const [periodEnd, setPeriodEnd] = useState(settings.periodEnd);
  const [preparedBy, setPreparedBy] = useState(settings.preparedBy || '');
  const [approvedBy, setApprovedBy] = useState(settings.approvedBy || '');
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      entityName,
      address,
      periodStart,
      periodEnd,
      preparedBy,
      approvedBy,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importJsonBackup(content);
      if (res.success) {
        setImportStatus('✓ Data cadangan berhasil dipulihkan.');
        setTimeout(() => onClose(), 1000);
      } else {
        setImportStatus(`✗ ${res.error || 'Gagal memulihkan data.'}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-xl shadow-2xl border border-[#E6E0D6] overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1A1A1A] text-[#F9F8F6] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-[#D3CBC0]" />
            <h3 className="text-lg font-bold font-editorial-serif">Pengaturan Entitas & Cadangan Sistem</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#D3CBC0] hover:text-[#FFFFFF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm font-editorial-sans">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Nama Entitas / Perusahaan</label>
              <input
                type="text"
                required
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1A1A1A] mb-1">Alamat Entitas</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Awal Periode Pembukuan</label>
                <input
                  type="date"
                  required
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] font-editorial-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Akhir Periode Pembukuan</label>
                <input
                  type="date"
                  required
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] font-editorial-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Disusun Oleh (Staff Akuntansi)</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">Disetujui Oleh (Direktur / CPA)</label>
                <input
                  type="text"
                  value={approvedBy}
                  onChange={(e) => setApprovedBy(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] rounded-lg shadow-xs transition-all"
              >
                Simpan Profil Entitas
              </button>
            </div>
          </form>

          {/* Backup & Restore Section */}
          <div className="border-t border-[#E6E0D6] pt-5 space-y-3">
            <h4 className="font-bold text-sm text-[#1A1A1A] font-editorial-serif">Cadangan Data & Reset (Backup / Restore)</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportJsonBackup}
                className="inline-flex items-center justify-center gap-2 p-3 bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg font-semibold text-[#1A1A1A] transition-colors"
              >
                <Download className="w-4 h-4 text-[#5C5852]" /> Ekspor Cadangan JSON
              </button>

              <label className="inline-flex items-center justify-center gap-2 p-3 bg-[#F9F8F6] hover:bg-[#EFECE5] border border-[#D3CBC0] rounded-lg font-semibold text-[#1A1A1A] cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-[#5C5852]" /> Impor / Pulihkan JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div className="p-2.5 text-xs font-semibold rounded-lg bg-[#FAF9F6] border border-[#D3CBC0] text-[#1A1A1A]">
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-[#E6E0D6]">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Muat ulang data sampel transaksi untuk standar aktif?')) {
                    loadSampleData();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1A1A1A] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Muat Ulang Data Sampel ({standard})
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus seluruh transaksi saat ini?')) {
                    clearAllData();
                    onClose();
                  }
                }}
                className="text-xs font-semibold text-[#991B1B] hover:underline"
              >
                Kosongkan Transaksi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
