import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  FileSpreadsheet,
  TableProperties,
  TrendingUp,
  Lock,
  ListTree,
  Calculator,
  Sparkles,
  Plus,
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { useAccounting } from './context/AccountingContext';
import { Header } from './components/Header';
import { BalanceIndicator } from './components/BalanceIndicator';
import { JournalView } from './views/JournalView';
import { LedgerView } from './views/LedgerView';
import { TrialBalanceView } from './views/TrialBalanceView';
import { WorksheetView } from './views/WorksheetView';
import { FinancialStatementsView } from './views/FinancialStatementsView';
import { ClosingEntriesView } from './views/ClosingEntriesView';
import { CoaView } from './views/CoaView';
import { CalculatorView } from './views/CalculatorView';
import { AiConsultantView } from './views/AiConsultantView';
import { TransactionModal } from './components/TransactionModal';
import { SmartParserModal } from './components/SmartParserModal';
import { SettingsModal } from './views/SettingsModal';
import { formatRupiah } from './utils/formatters';

type ActiveTab =
  | 'journal'
  | 'ledger'
  | 'trialBalance'
  | 'worksheet'
  | 'financialStatements'
  | 'closing'
  | 'coa'
  | 'calculator'
  | 'aiConsultant';

const TABS: Array<{
  id: ActiveTab;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
  step: string;
}> = [
  { id: 'journal', label: 'Jurnal Umum', sublabel: 'Pencatatan Transaksi', icon: BookOpen, step: '01' },
  { id: 'ledger', label: 'Buku Besar', sublabel: 'Akun Bentuk T & Saldo', icon: Layers, step: '02' },
  { id: 'trialBalance', label: 'Neraca Saldo', sublabel: 'Validasi Keseimbangan', icon: FileSpreadsheet, step: '03' },
  { id: 'worksheet', label: 'Kertas Kerja', sublabel: 'Neraca Lajur 10 Kolom', icon: TableProperties, step: '04' },
  { id: 'financialStatements', label: 'Laporan Keuangan', sublabel: 'Laba Rugi & Neraca', icon: TrendingUp, step: '05' },
  { id: 'closing', label: 'Jurnal Penutup', sublabel: 'Closing & Reversing', icon: Lock, step: '06' },
  { id: 'aiConsultant', label: 'AI Akuntan', sublabel: 'Konsultan CPA & Soal', icon: Sparkles, step: 'AI' },
  { id: 'coa', label: 'Bagan Akun', sublabel: 'Chart of Accounts', icon: ListTree, step: 'COA' },
  { id: 'calculator', label: 'Kalkulator', sublabel: 'Depresiasi & Rasio', icon: Calculator, step: 'CALC' },
];

export function App() {
  const {
    standard,
    transactions,
    accounts,
    addTransaction,
    isBalanced,
    totalDebit,
    totalCredit,
    difference,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<ActiveTab>('journal');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleBulkImportTransactions = (newTransactions: any[]) => {
    newTransactions.forEach((tx) => {
      addTransaction(tx);
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1A1A1A] flex flex-col font-editorial-sans selection:bg-[#1A1A1A] selection:text-[#F9F8F6]">
      {/* Top Header */}
      <Header
        onOpenParser={() => setIsParserModalOpen(true)}
        onOpenCalculator={() => setActiveTab('calculator')}
        onOpenAiConsultant={() => setActiveTab('aiConsultant')}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Navigation Subheader / Workflow Stepper */}
      <nav className="bg-[#FFFFFF] border-b border-[#E6E0D6] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 overflow-x-auto py-2.5 no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-150 relative ${
                      isActive
                        ? 'bg-[#1A1A1A] text-[#F9F8F6] font-semibold shadow-xs'
                        : 'text-[#5C5852] hover:text-[#1A1A1A] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-editorial-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-[#333333] text-[#86EFAC]'
                          : 'bg-[#EFECE5] text-[#8C877E] group-hover:text-[#1A1A1A]'
                      }`}
                    >
                      {tab.step}
                    </span>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="whitespace-nowrap font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Action Button */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#E6E0D6] flex-shrink-0">
              <button
                onClick={() => setIsTxModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-[#F9F8F6] hover:bg-[#2F2C28] rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Transaksi Baru</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'journal' && (
          <JournalView
            onOpenNewTransaction={() => setIsTxModalOpen(true)}
            onOpenParser={() => setIsParserModalOpen(true)}
          />
        )}

        {activeTab === 'ledger' && <LedgerView />}

        {activeTab === 'trialBalance' && <TrialBalanceView />}

        {activeTab === 'worksheet' && <WorksheetView />}

        {activeTab === 'financialStatements' && <FinancialStatementsView />}

        {activeTab === 'closing' && <ClosingEntriesView />}

        {activeTab === 'aiConsultant' && (
          <AiConsultantView
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenSmartParser={() => setIsParserModalOpen(true)}
          />
        )}

        {activeTab === 'coa' && <CoaView />}

        {activeTab === 'calculator' && <CalculatorView />}
      </main>

      {/* Global Balance Indicator Bar (Bottom) */}
      <footer className="bg-[#FFFFFF] border-t border-[#E6E0D6] py-2.5 px-4 sm:px-6 sticky bottom-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-editorial-mono">
          <div className="flex items-center gap-4">
            <span className="text-[#5C5852]">
              Standar: <strong className="text-[#1A1A1A] font-bold">{standard}</strong>
            </span>
            <span className="text-[#D3CBC0]">|</span>
            <span className="text-[#5C5852]">
              Total Transaksi: <strong className="text-[#1A1A1A]">{transactions.length}</strong>
            </span>
          </div>

          <BalanceIndicator
            isBalanced={isBalanced}
            totalDebit={totalDebit}
            totalCredit={totalCredit}
            difference={difference}
          />
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
      />

      <SmartParserModal
        isOpen={isParserModalOpen}
        onClose={() => setIsParserModalOpen(false)}
        onImportTransactions={handleBulkImportTransactions}
        accounts={accounts}
        standard={standard}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

export default App;
