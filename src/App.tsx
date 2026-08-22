import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Layers,
  Scale,
  TableProperties,
  TrendingUp,
  Lock,
  Calculator,
  ListTree,
  Plus,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Header } from './components/Header';
import { JournalView } from './views/JournalView';
import { AdjustingJournalView } from './views/AdjustingJournalView';
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
import { Transaction } from './types/accounting';

type ActiveTab =
  | 'journal'
  | 'adjusting'
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
  { id: 'journal', label: 'Jurnal Umum', sublabel: 'General Journal (JU)', icon: FileText, step: '01' },
  { id: 'adjusting', label: 'Penyesuaian', sublabel: 'Adjusting Entries (AJP)', icon: Layers, step: '02' },
  { id: 'ledger', label: 'Buku Besar', sublabel: 'Posting Akun', icon: BookOpen, step: '03' },
  { id: 'trialBalance', label: 'Neraca Saldo', sublabel: 'Uji Keseimbangan', icon: Scale, step: '04' },
  { id: 'worksheet', label: 'Kertas Kerja', sublabel: 'Neraca Lajur 10 Kolom', icon: TableProperties, step: '05' },
  { id: 'financialStatements', label: 'Laporan Keuangan', sublabel: 'Laba Rugi & Neraca', icon: TrendingUp, step: '06' },
  { id: 'closing', label: 'Jurnal Penutup', sublabel: 'Closing & Reversing', icon: Lock, step: '07' },
  { id: 'aiConsultant', label: 'AI Akuntan', sublabel: 'Konsultan CPA & Soal', icon: Sparkles, step: 'AI' },
  { id: 'coa', label: 'Bagan Akun', sublabel: 'Chart of Accounts', icon: ListTree, step: 'COA' },
  { id: 'calculator', label: 'Kalkulator', sublabel: 'Depresiasi & Rasio', icon: Calculator, step: 'CALC' },
];

function MainContent() {
  const { accounts, addTransaction, updateTransaction, addMultipleTransactions, standard, settings } = useAccounting();
  const [activeTab, setActiveTab] = useState<ActiveTab>('journal');

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalEditing, setTxModalEditing] = useState<Transaction | null>(null);
  const [txModalDefaultCategory, setTxModalDefaultCategory] = useState<'umum' | 'penyesuaian'>('umum');

  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenTransactionModal = (tx?: Transaction, defaultCat: 'umum' | 'penyesuaian' = 'umum') => {
    setTxModalEditing(tx || null);
    setTxModalDefaultCategory(defaultCat);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>) => {
    if (txModalEditing) {
      updateTransaction(txModalEditing.id, txData);
    } else {
      addTransaction(txData);
    }
  };

  const handleImportBatch = (drafts: any[]) => {
    addMultipleTransactions(drafts);
    setIsParserModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] flex flex-col font-editorial-sans selection:bg-[#E6E0D6] selection:text-[#1A1A1A]">
      {/* Editorial Top Masthead */}
      <Header
        onOpenParser={() => setIsParserModalOpen(true)}
        onOpenCalculator={() => setActiveTab('calculator')}
        onOpenAiConsultant={() => setActiveTab('aiConsultant')}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Cycle Navigation Bar - Editorial Style */}
      <div className="bg-[#FFFFFF] border-b border-[#E6E0D6] sticky top-16 sm:top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-1 overflow-x-auto py-2.5 scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-[#1A1A1A] text-[#F9F8F6] shadow-xs'
                      : 'text-[#5C5852] hover:text-[#1A1A1A] hover:bg-[#F4F1EA]'
                  }`}
                >
                  <span
                    className={`font-editorial-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-[#33302C] text-[#E6E0D6]' : 'bg-[#EFECE5] text-[#8C877E]'
                    }`}
                  >
                    {tab.step}
                  </span>
                  <div className="flex flex-col text-left">
                    <span className="leading-tight font-medium">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'journal' && (
          <JournalView
            onOpenTransactionModal={(tx) => handleOpenTransactionModal(tx, 'umum')}
            onOpenParser={() => setIsParserModalOpen(true)}
          />
        )}

        {activeTab === 'adjusting' && (
          <AdjustingJournalView
            onOpenTransactionModal={(tx, defaultCat) => handleOpenTransactionModal(tx, defaultCat || 'penyesuaian')}
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

      {/* Mobile iOS / Android Bottom Tab Bar (Responsive, safe area, touch-optimized) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E6E0D6] px-1 py-1 flex items-center justify-around shadow-lg safe-area-inset-bottom">
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg flex-1 min-w-0 transition-colors ${
            activeTab === 'journal' ? 'text-[#1A1A1A] font-bold' : 'text-[#8C877E]'
          }`}
        >
          <FileText className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] truncate leading-tight font-medium">Jurnal</span>
        </button>

        <button
          onClick={() => setActiveTab('adjusting')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg flex-1 min-w-0 transition-colors ${
            activeTab === 'adjusting' ? 'text-[#1A1A1A] font-bold' : 'text-[#8C877E]'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] truncate leading-tight font-medium">AJP</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg flex-1 min-w-0 transition-colors ${
            activeTab === 'ledger' ? 'text-[#1A1A1A] font-bold' : 'text-[#8C877E]'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] truncate leading-tight font-medium">Buku Besar</span>
        </button>

        <button
          onClick={() => setActiveTab('worksheet')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg flex-1 min-w-0 transition-colors ${
            activeTab === 'worksheet' ? 'text-[#1A1A1A] font-bold' : 'text-[#8C877E]'
          }`}
        >
          <TableProperties className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] truncate leading-tight font-medium">Kertas Kerja</span>
        </button>

        <button
          onClick={() => setActiveTab('financialStatements')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg flex-1 min-w-0 transition-colors ${
            activeTab === 'financialStatements' ? 'text-[#1A1A1A] font-bold' : 'text-[#8C877E]'
          }`}
        >
          <TrendingUp className="w-4 h-4 mb-0.5" />
          <span className="text-[9px] truncate leading-tight font-medium">Laporan</span>
        </button>

        <button
          onClick={() => setActiveTab('aiConsultant')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg flex-1 min-w-0 transition-colors ${
            activeTab === 'aiConsultant' ? 'text-[#166534] font-bold' : 'text-[#8C877E]'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-[#16A34A]" />
          <span className="text-[9px] truncate leading-tight font-medium">AI</span>
        </button>
      </div>

      {/* Editorial Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#E6E0D6] py-6 pb-24 sm:pb-6 text-xs text-[#5C5852] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-editorial-serif font-bold text-[#1A1A1A]">NarKuntansi by Nadhif A.R</span>
            <span className="text-[#8C877E]">•</span>
            <span>Standar Aktif: <strong className="text-[#1A1A1A]">{standard}</strong></span>
            <span className="text-[#8C877E]">•</span>
            <span>{settings.entityName}</span>
          </div>
          <div className="text-[#8C877E] text-[11px] font-editorial-mono text-center sm:text-right">
            Siklus Akuntansi Berpasangan (Double-Entry) Sesuai Standar Akuntansi Keuangan Indonesia
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        editTransaction={txModalEditing}
        accounts={accounts}
        defaultCategory={txModalDefaultCategory}
        existingTransactions={useAccounting().transactions}
      />

      <SmartParserModal
        isOpen={isParserModalOpen}
        onClose={() => setIsParserModalOpen(false)}
        onImportBatch={handleImportBatch}
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

export default function App() {
  return (
    <AccountingProvider>
      <MainContent />
    </AccountingProvider>
  );
}
