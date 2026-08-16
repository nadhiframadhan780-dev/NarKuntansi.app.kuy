import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Calculator,
  RotateCcw,
  Settings,
  ChevronDown,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAccounting } from '../context/AccountingContext';
import { AccountingStandard } from '../types/accounting';
import { STANDARD_DESCRIPTIONS } from '../data/coaStandards';
import { exportAllReportsToExcel } from '../utils/excelExporter';

interface HeaderProps {
  onOpenParser: () => void;
  onOpenCalculator: () => void;
  onOpenAiConsultant?: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenParser,
  onOpenCalculator,
  onOpenAiConsultant,
  onOpenSettings,
}) => {
  const {
    standard,
    setStandard,
    settings,
    accounts,
    transactions,
    trialBalance,
    loadSampleData,
  } = useAccounting();

  const [isStandardDropdownOpen, setIsStandardDropdownOpen] = useState(false);

  const handleExportExcel = () => {
    exportAllReportsToExcel({
      settings,
      standard,
      accounts,
      transactions,
    });
  };

  const handleSelectStandard = (std: AccountingStandard) => {
    if (std === standard) return;
    const confirmChange = window.confirm(
      `Ganti standar akuntansi ke ${std}?\n\nPerubahan ini akan memperbarui Bagan Akun (COA) dan memuat data transaksi contoh yang relevan.`
    );
    if (confirmChange) {
      setStandard(std, true);
      setIsStandardDropdownOpen(false);
    }
  };

  return (
    <header className="bg-[#FFFFFF] border-b border-[#E6E0D6] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Entity Name */}
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div className="hidden md:block h-8 w-px bg-[#E6E0D6]" />
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-[#1A1A1A] truncate max-w-[220px] font-editorial-serif tracking-tight">
                {settings.entityName}
              </span>
              <span className="text-[11px] text-[#5C5852] font-editorial-mono">
                Periode: {settings.periodStart} s/d {settings.periodEnd}
              </span>
            </div>
          </div>

          {/* Standard Selector Badge & Center Balance Status */}
          <div className="flex items-center gap-3">
            {/* Standard Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStandardDropdownOpen(!isStandardDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F9F8F6] hover:bg-[#F0EBE1] text-[#1A1A1A] border border-[#D3CBC0] transition-colors shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#5C5852]" />
                <span className="font-medium">{standard}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C877E]" />
              </button>

              {isStandardDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FFFFFF] rounded-xl shadow-xl border border-[#D3CBC0] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-[#E6E0D6]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C877E] font-editorial-sans">
                      Standar Akuntansi Indonesia
                    </span>
                  </div>

                  <div className="py-1 space-y-1">
                    {Object.values(AccountingStandard).map((std) => {
                      const desc = STANDARD_DESCRIPTIONS[std];
                      const isSelected = std === standard;
                      return (
                        <button
                          key={std}
                          onClick={() => handleSelectStandard(std)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-[#1A1A1A] text-[#F9F8F6] font-semibold'
                              : 'hover:bg-[#F9F8F6] text-[#1A1A1A]'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              isSelected ? 'bg-[#F9F8F6]' : 'bg-[#D3CBC0]'
                            }`}
                          />
                          <div>
                            <div className="font-bold flex items-center gap-1.5 font-editorial-serif text-sm">
                              {desc.name}
                              {isSelected && (
                                <span className="text-[9px] bg-[#5C5852] text-[#F9F8F6] px-1.5 py-0.2 rounded font-sans uppercase tracking-wider">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <div className={`text-[10px] font-normal line-clamp-1 ${isSelected ? 'text-[#D3CBC0]' : 'text-[#5C5852]'}`}>
                              {desc.tagline}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Trial Balance Health Pill */}
            <div className="hidden lg:flex items-center">
              {trialBalance.isBalanced ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                  Neraca Saldo: Seimbang
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
                  Selisih Rp {trialBalance.difference.toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* AI CPA Consultant Tab Shortcut */}
            {onOpenAiConsultant && (
              <button
                onClick={onOpenAiConsultant}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#166534] bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#86EFAC] transition-all shadow-2xs"
                title="Tanya AI Akuntan / Bahas Soal Kasus"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                <span className="hidden sm:inline">AI Akuntan</span>
              </button>
            )}

            {/* AI / Smart Parser */}
            <button
              onClick={onOpenParser}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1A1A1A] bg-[#F4F1EA] hover:bg-[#EBE5DB] border border-[#D3CBC0] transition-all shadow-2xs"
              title="Parser Soal Cerita Akuntansi"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#5C5852]" />
              <span className="hidden sm:inline">Parser Soal</span>
            </button>

            {/* Financial Calculator */}
            <button
              onClick={onOpenCalculator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1A1A1A] bg-[#F4F1EA] hover:bg-[#EBE5DB] border border-[#D3CBC0] transition-colors shadow-2xs"
              title="Kalkulator Akuntansi & Finansial"
            >
              <Calculator className="w-3.5 h-3.5 text-[#5C5852]" />
              <span className="hidden sm:inline">Kalkulator</span>
            </button>

            {/* Excel Export Button */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#F9F8F6] bg-[#1A1A1A] hover:bg-[#2F2C28] border border-[#1A1A1A] transition-all shadow-xs"
              title="Ekspor Seluruh Laporan ke Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-[#5C5852] hover:text-[#1A1A1A] hover:bg-[#F4F1EA] transition-colors border border-[#D3CBC0]"
              title="Pengaturan Entitas, Kunci API Gemini, & Cadangan Data"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

