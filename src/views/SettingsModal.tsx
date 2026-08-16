import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Building,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { testGeminiApiKey } from '../utils/geminiAiService';

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
  const [customLogoUrl, setCustomLogoUrl] = useState(settings.customLogoUrl || '');
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [aiModelPreference, setAiModelPreference] = useState(settings.aiModelPreference || 'gemini-2.5-flash');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: settings.geminiApiKey ? 'success' : 'idle',
    message: settings.geminiApiKey ? 'Kunci tersimpan di peramban' : '',
  });
  const [importStatus, setImportStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file logo maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCustomLogoUrl(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestKey = async () => {
    if (!geminiApiKey.trim()) {
      setTestResult({ status: 'error', message: 'Silakan ketik atau tempelkan Kunci API Gemini Anda terlebih dahulu.' });
      return;
    }

    setIsTestingKey(true);
    setTestResult({ status: 'idle', message: 'Menguji koneksi ke Google Gemini AI...' });

    const res = await testGeminiApiKey(geminiApiKey, aiModelPreference);
    setIsTestingKey(false);
    if (res.valid) {
      setTestResult({ status: 'success', message: res.message });
      // Auto save the tested working key
      updateSettings({ geminiApiKey: geminiApiKey.trim(), aiModelPreference });
    } else {
      setTestResult({ status: 'error', message: res.message });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      entityName,
      address,
      periodStart,
      periodEnd,
      preparedBy,
      approvedBy,
      customLogoUrl,
      geminiApiKey: geminiApiKey.trim(),
      aiModelPreference,
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
            <h3 className="text-lg font-bold font-editorial-serif">Pengaturan Entitas & AI Gemini</h3>
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
          <form onSubmit={handleSave} className="space-y-6">
            {/* AI Gemini Section */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E6E0D6] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#1A1A1A] text-[#86EFAC] rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1A1A1A] font-editorial-serif">
                      Kunci API Google Gemini (AI Akuntan CPA)
                    </h4>
                    <p className="text-[11px] text-[#5C5852]">
                      Untuk analisis soal cerita otomatis & konsultasi akuntansi tanpa batas token.
                    </p>
                  </div>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1A1A1A] hover:underline"
                >
                  Dapatkan API Key Gratis <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] mb-1">
                  Gemini API Key
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={geminiApiKey}
                    onChange={(e) => {
                      setGeminiApiKey(e.target.value);
                      setTestResult({ status: 'idle', message: '' });
                    }}
                    placeholder="AIzaSy..."
                    className="w-full pl-8 pr-20 py-2 bg-[#FFFFFF] border border-[#D3CBC0] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-[#1A1A1A] font-editorial-mono text-xs"
                  />
                  <Key className="w-4 h-4 text-[#8C877E] absolute left-2.5 pointer-events-none" />
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 text-[#8C877E] hover:text-[#1A1A1A]"
                      title={showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={handleTestKey}
                      disabled={isTestingKey || !geminiApiKey.trim()}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        isTestingKey || !geminiApiKey.trim()
                          ? 'bg-[#EFECE5] text-[#8C877E] cursor-not-allowed'
                          : 'bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#2F2C28]'
                      }`}
                    >
                      {isTestingKey ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Uji Kunci'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1 text-[11px]">
                    Model Gemini
                  </label>
                  <select
                    value={aiModelPreference}
                    onChange={(e) => setAiModelPreference(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FFFFFF] border border-[#D3CBC0] rounded-lg text-xs font-editorial-sans"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Cepat & Cerdas - Rekomendasi)</option>
                    <option value="gemini-3.7-flash">Gemini 3.7 Flash (Terkini)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Penalaran Mendalam)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1A1A1A] mb-1 text-[11px]">
                    Status AI
                  </label>
                  <div className="flex items-center gap-1.5 py-1.5 px-2.5 bg-[#FFFFFF] border border-[#D3CBC0] rounded-lg text-xs">
                    {testResult.status === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                        <span className="text-[#166534] font-medium truncate">{testResult.message || 'AI Siap Digunakan'}</span>
                      </>
                    ) : testResult.status === 'error' ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0" />
                        <span className="text-[#991B1B] font-medium truncate">{testResult.message}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#D3CBC0]" />
                        <span className="text-[#5C5852]">Belum diuji / Menggunakan mode lokal</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#1A1A1A] font-editorial-serif">Profil & Logo Entitas</h4>

              {/* Logo Customizer */}
              <div className="p-3.5 bg-[#FAF9F6] border border-[#E6E0D6] rounded-xl space-y-3">
                <label className="block font-semibold text-[#1A1A1A] text-xs">
                  Logo Entitas / Perusahaan Anda
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Logo Preview Box */}
                  <div className="w-16 h-16 rounded-xl bg-[#FFFFFF] border-2 border-dashed border-[#D3CBC0] flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0 relative group shadow-2xs">
                    {customLogoUrl ? (
                      <img
                        src={customLogoUrl}
                        alt="Preview Logo"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#8C877E]">
                        <ImageIcon className="w-6 h-6" />
                        <span className="text-[9px] mt-0.5">Default</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#2F2C28] text-xs font-bold rounded-lg transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File Logo (PNG/JPG/SVG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUploadLogo}
                          className="hidden"
                        />
                      </label>

                      {customLogoUrl && (
                        <button
                          type="button"
                          onClick={() => setCustomLogoUrl('')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] border border-[#FECACA] text-xs font-semibold rounded-lg transition-colors"
                          title="Hapus logo khusus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="Atau tempelkan tautan URL gambar (https://...)"
                        className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#D3CBC0] rounded-lg text-xs font-editorial-mono focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                      />
                    </div>
                    <p className="text-[11px] text-[#8C877E]">
                      Logo otomatis muncul di Header atas, laporan keuangan, dan <strong>Favicon Tab Browser</strong> Anda. Ukuran disarankan rasio 1:1 (persegi).
                    </p>
                  </div>
                </div>
              </div>

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
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] rounded-lg shadow-xs transition-all"
              >
                Simpan Seluruh Pengaturan & Kunci AI
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
