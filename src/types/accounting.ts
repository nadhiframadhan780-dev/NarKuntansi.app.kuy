export enum AccountingStandard {
  PSAK = 'PSAK', // SAK Umum / PSAK (IFRS)
  SAK_EMKM = 'SAK_EMKM', // SAK Entitas Mikro, Kecil, dan Menengah
  SAK_SYARIAH = 'SAK_SYARIAH', // SAK Syariah (Tanpa Bunga, Akad Syariah)
  SAK_EP = 'SAK_EP', // SAK Entitas Privat (2025)
  SAP = 'SAP', // Standar Akuntansi Pemerintahan (PP 71/2010 Dual-Track)
}

export enum AccountCategory {
  ASET = 'ASET',
  LIABILITAS = 'LIABILITAS',
  EKUITAS = 'EKUITAS',
  PENDAPATAN = 'PENDAPATAN',
  BEBAN = 'BEBAN',
  DANA_SYARIAH = 'DANA_SYARIAH', // Khusus Syariah: Dana Zakat, Qardhul Hasan
  PENDAPATAN_LRA = 'PENDAPATAN_LRA', // Khusus SAP
  BELANJA_LRA = 'BELANJA_LRA', // Khusus SAP
  PEMBIAYAAN_LRA = 'PEMBIAYAAN_LRA', // Khusus SAP
}

export enum NormalBalance {
  DEBIT = 'DEBIT',
  KREDIT = 'KREDIT',
}

export interface Account {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  subCategory?: string; // e.g., 'Aset Lancar', 'Aset Tetap', 'Liabilitas Lancar'
  normalBalance: NormalBalance;
  isContra?: boolean; // e.g. Akumulasi Penyusutan, Retur Penjualan, CKPN
  description?: string;
  isCustom?: boolean;
}

export interface JournalEntryItem {
  id?: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  refNumber: string;
  description: string;
  category: 'umum' | 'penyesuaian' | 'penutup' | 'pembalik';
  entries: JournalEntryItem[];
  notes?: string;
  // SAP specific budget/LRA dual entry
  sapBudgetEntries?: JournalEntryItem[];
  createdAt?: string;
}

export interface LedgerEntry {
  date: string;
  refNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
  category: 'umum' | 'penyesuaian' | 'penutup' | 'pembalik';
}

export interface LedgerAccount {
  account: Account;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  endingBalance: number;
  endingBalanceDebit: number;
  endingBalanceCredit: number;
}

export interface TrialBalanceItem {
  account: Account;
  debit: number;
  credit: number;
}

export interface TrialBalanceResult {
  items: TrialBalanceItem[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  difference: number;
}

export interface WorksheetRow {
  account: Account;
  trialBalance: { debit: number; credit: number };
  adjustment: { debit: number; credit: number };
  adjustedTrialBalance: { debit: number; credit: number };
  incomeStatement: { debit: number; credit: number };
  balanceSheet: { debit: number; credit: number };
}

export interface WorksheetResult {
  rows: WorksheetRow[];
  totals: {
    trialBalance: { debit: number; credit: number; diff: number; balanced: boolean };
    adjustment: { debit: number; credit: number; diff: number; balanced: boolean };
    adjustedTrialBalance: { debit: number; credit: number; diff: number; balanced: boolean };
    incomeStatement: { debit: number; credit: number; diff: number };
    balanceSheet: { debit: number; credit: number; diff: number };
  };
  netIncome: number; // Laba/Rugi Bersih
  isNetIncome: boolean; // true = Laba, false = Rugi
  finalBalanced: boolean;
}

export interface EntitySettings {
  entityName: string;
  entityType: string;
  standard: AccountingStandard;
  address: string;
  periodStart: string;
  periodEnd: string;
  currency: string;
  initialCash: number;
  aiApiKey?: string;
  preparedBy: string;
  approvedBy: string;
}

export interface AppState {
  version: string;
  standard: AccountingStandard;
  settings: EntitySettings;
  accounts: Account[];
  transactions: Transaction[];
}
